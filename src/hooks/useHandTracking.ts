import { useState, useEffect, useRef, useCallback } from 'react';
import { CursorPosition, GestureState, TrackingStatus } from '../types/game';
import { sounds } from '../services/soundEffects';

interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

interface HandResults {
  multiHandLandmarks?: Landmark[][];
  multiHandedness?: unknown[];
  image?: HTMLVideoElement | HTMLCanvasElement;
}

interface MediaPipeHandsInstance {
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (callback: (results: HandResults) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close?: () => void;
}

interface MediaPipeCameraInstance {
  start: () => Promise<void>;
  stop: () => void;
}

export function useHandTracking() {
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('NOT_STARTED');
  const [gestureState, setGestureState] = useState<GestureState>('OPEN');
  const [cursor, setCursor] = useState<CursorPosition>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    isPinching: false,
    pinchDistance: 1.0,
  });
  const [isMouseFallback, setIsMouseFallback] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showPip, setShowPip] = useState<boolean>(true);

  // Calibration progress states
  const [hasSeenHand, setHasSeenHand] = useState<boolean>(false);
  const [hasPointed, setHasPointed] = useState<boolean>(false);
  const [hasPinched, setHasPinched] = useState<boolean>(false);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraInstanceRef = useRef<MediaPipeCameraInstance | null>(null);
  const handsInstanceRef = useRef<MediaPipeHandsInstance | null>(null);

  // Smooth position tracking
  const smoothPosRef = useRef<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
  });

  // Internal state for debounce & hysteresis
  const isPinchingRef = useRef<boolean>(false);
  const prevPinchStateRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const animFrameIdRef = useRef<number | null>(null);

  // Hysteresis thresholds for pinch
  const PINCH_THRESHOLD_ENTER = 0.075;
  const PINCH_THRESHOLD_EXIT = 0.095;

  // Draw hand skeleton on PIP canvas
  const drawSkeleton = useCallback((landmarks: Landmark[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hand connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // index
      [0, 9], [9, 10], [10, 11], [11, 12], // middle
      [0, 13], [13, 14], [14, 15], [15, 16], // ring
      [0, 17], [17, 18], [18, 19], [19, 20], // pinky
      [5, 9], [9, 13], [13, 17] // palm
    ];

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';

    // Connections
    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2) {
        ctx.beginPath();
        // Video is mirrored on preview, so match mirrored canvas
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.stroke();
      }
    });

    // Landmarks points
    landmarks.forEach((p, idx) => {
      ctx.beginPath();
      const px = p.x * canvas.width;
      const py = p.y * canvas.height;
      ctx.arc(px, py, idx === 8 || idx === 4 ? 4 : 2, 0, 2 * Math.PI);
      if (idx === 8) {
        ctx.fillStyle = '#38bdf8'; // Index fingertip (cyan)
      } else if (idx === 4) {
        ctx.fillStyle = '#34d399'; // Thumb tip (emerald)
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.fill();
    });
  }, []);

  // Handle MediaPipe detection results
  const onResults = useCallback((results: HandResults) => {
    if (!isMountedRef.current || isMouseFallback) return;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      setHasSeenHand(true);

      const wrist = landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const middleMcp = landmarks[9];

      if (thumbTip && indexTip && wrist && middleMcp) {
        setHasPointed(true);

        // Scale-invariant hand normalization (distance between wrist and middle MCP)
        const palmScale = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y);
        const handScale = Math.max(0.12, palmScale);

        // Distance in normalized coordinates
        const dx = thumbTip.x - indexTip.x;
        const dy = thumbTip.y - indexTip.y;
        const dz = (thumbTip.z || 0) - (indexTip.z || 0);
        const rawDistance = Math.hypot(dx, dy, dz);
        const normalizedPinchRatio = rawDistance / handScale;

        // Scale-invariant hysteresis logic
        let pinching = isPinchingRef.current;
        if (!pinching && normalizedPinchRatio < 0.35) {
          pinching = true;
          setHasPinched(true);
        } else if (pinching && normalizedPinchRatio > 0.48) {
          pinching = false;
        }
        isPinchingRef.current = pinching;

        // Gesture state machine
        if (pinching && !prevPinchStateRef.current) {
          setGestureState('PINCH_START');
          sounds.playGrab();
          setTimeout(() => {
            if (isPinchingRef.current && isMountedRef.current) {
              setGestureState('GRABBED');
            }
          }, 35);
        } else if (!pinching && prevPinchStateRef.current) {
          setGestureState('PINCH_RELEASE');
          sounds.playDrop();
          setTimeout(() => {
            if (!isPinchingRef.current && isMountedRef.current) {
              setGestureState('DROP');
              setTimeout(() => {
                if (isMountedRef.current) setGestureState('OPEN');
              }, 60);
            }
          }, 35);
        } else if (pinching) {
          setGestureState('GRABBED');
        } else {
          setGestureState('OPEN');
        }
        prevPinchStateRef.current = pinching;

        // Mirrored X mapping: camera sees mirrored indexTip
        const targetX = Math.max(8, Math.min(window.innerWidth - 8, (1 - indexTip.x) * window.innerWidth));
        const targetY = Math.max(8, Math.min(window.innerHeight - 8, indexTip.y * window.innerHeight));

        // Adaptive Dynamic Smoothing (1-Euro style velocity response)
        const deltaDist = Math.hypot(
          targetX - smoothPosRef.current.x,
          targetY - smoothPosRef.current.y
        );

        // Micro-jitter deadband: if hand moved < 1.2 pixels, do not jitter
        if (deltaDist > 1.2) {
          // Adaptive alpha: 0.22 when stationary/slow to 0.78 when moving fast
          const adaptiveAlpha = Math.min(0.78, Math.max(0.22, deltaDist / 85));
          smoothPosRef.current.x += (targetX - smoothPosRef.current.x) * adaptiveAlpha;
          smoothPosRef.current.y += (targetY - smoothPosRef.current.y) * adaptiveAlpha;
        }

        const finalX = Math.round(smoothPosRef.current.x);
        const finalY = Math.round(smoothPosRef.current.y);

        setCursor({
          x: finalX,
          y: finalY,
          isPinching: pinching,
          pinchDistance: rawDistance,
          rawX: indexTip.x,
          rawY: indexTip.y,
        });

        setTrackingStatus(pinching ? 'PINCHING' : 'HAND_DETECTED');

        // Draw preview skeleton
        drawSkeleton(landmarks);
      }
    } else {
      setTrackingStatus('NO_HAND');
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [drawSkeleton, isMouseFallback]);

  // Start webcam and MediaPipe
  const startCamera = useCallback(async () => {
    try {
      setTrackingStatus('INITIALIZING');
      setCameraError(null);

      // Check for getUserMedia support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam not supported in this environment');
      }

      // Check MediaPipe availability
      const win = window as unknown as {
        Hands?: new (options: { locateFile: (file: string) => string }) => MediaPipeHandsInstance;
        Camera?: new (
          video: HTMLVideoElement,
          options: { onFrame: () => Promise<void>; width: number; height: number }
        ) => MediaPipeCameraInstance;
      };

      if (!win.Hands || !win.Camera) {
        // Wait a moment in case scripts are still parsing
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      if (!win.Hands || !win.Camera) {
        throw new Error('MediaPipe Hands library is still loading or unavailable. Using mouse fallback.');
      }

      const hands = new win.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(onResults);
      handsInstanceRef.current = hands;

      if (!videoRef.current) {
        const video = document.createElement('video');
        video.setAttribute('playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.style.display = 'none';
        document.body.appendChild(video);
        videoRef.current = video;
      }

      const camera = new win.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsInstanceRef.current && !isMouseFallback) {
            await handsInstanceRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      await camera.start();
      cameraInstanceRef.current = camera;
      setTrackingStatus('HAND_DETECTED');
      setIsMouseFallback(false);
    } catch (err: unknown) {
      let msg = 'Camera initialization failed. Using mouse and touch mode.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.message.toLowerCase().includes('permission')) {
          msg = 'Camera access was blocked or denied by browser/iframe policy. Mouse & Touch mode is active!';
        } else {
          msg = err.message;
        }
      }
      setCameraError(msg);
      setTrackingStatus('MOUSE_MODE');
      setIsMouseFallback(true);
    }
  }, [isMouseFallback, onResults]);

  // Switch to mouse/touch fallback and shut off camera hardware
  const enableMouseFallback = useCallback(() => {
    if (cameraInstanceRef.current) {
      try {
        cameraInstanceRef.current.stop();
      } catch {
        // ignore
      }
      cameraInstanceRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
      videoRef.current.srcObject = null;
    }
    setIsMouseFallback(true);
    setTrackingStatus('MOUSE_MODE');
    setHasSeenHand(true);
    setHasPointed(true);
    setHasPinched(true);
  }, []);

  // Switch back to camera
  const enableCameraMode = useCallback(() => {
    setIsMouseFallback(false);
    startCamera();
  }, [startCamera]);

  // Mouse / Touch event handlers for desktop and mobile fallback
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseFallback) return;
    setCursor((prev) => ({
      ...prev,
      x: e.clientX,
      y: e.clientY,
    }));
  }, [isMouseFallback]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!isMouseFallback) return;
    // Don't pinch if clicking on interactive header buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;

    isPinchingRef.current = true;
    prevPinchStateRef.current = true;
    setGestureState('PINCH_START');
    sounds.playGrab();

    setCursor((prev) => ({
      ...prev,
      x: e.clientX,
      y: e.clientY,
      isPinching: true,
      pinchDistance: 0.02,
    }));

    setTimeout(() => {
      if (isPinchingRef.current) setGestureState('GRABBED');
    }, 40);
  }, [isMouseFallback]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isMouseFallback) return;
    isPinchingRef.current = false;
    prevPinchStateRef.current = false;
    setGestureState('PINCH_RELEASE');
    sounds.playDrop();

    setCursor((prev) => ({
      ...prev,
      x: e.clientX,
      y: e.clientY,
      isPinching: false,
      pinchDistance: 1.0,
    }));

    setTimeout(() => {
      setGestureState('DROP');
      setTimeout(() => setGestureState('OPEN'), 80);
    }, 40);
  }, [isMouseFallback]);

  // Touch handlers
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isMouseFallback || !e.touches[0]) return;
    const t = e.touches[0];
    setCursor((prev) => ({
      ...prev,
      x: t.clientX,
      y: t.clientY,
    }));
  }, [isMouseFallback]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMouseFallback || !e.touches[0]) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;

    const t = e.touches[0];
    isPinchingRef.current = true;
    setGestureState('GRABBED');
    sounds.playGrab();

    setCursor((prev) => ({
      ...prev,
      x: t.clientX,
      y: t.clientY,
      isPinching: true,
      pinchDistance: 0.02,
    }));
  }, [isMouseFallback]);

  const handleTouchEnd = useCallback(() => {
    if (!isMouseFallback) return;
    isPinchingRef.current = false;
    setGestureState('DROP');
    sounds.playDrop();

    setCursor((prev) => ({
      ...prev,
      isPinching: false,
      pinchDistance: 1.0,
    }));

    setTimeout(() => setGestureState('OPEN'), 80);
  }, [isMouseFallback]);

  // Attach global mouse/touch listeners when in fallback mode
  useEffect(() => {
    if (isMouseFallback) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isMouseFallback, handleMouseMove, handleMouseDown, handleMouseUp, handleTouchMove, handleTouchStart, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (cameraInstanceRef.current) {
        try {
          cameraInstanceRef.current.stop();
        } catch {
          // Ignore
        }
      }
      if (videoRef.current && videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }
    };
  }, []);

  return {
    trackingStatus,
    gestureState,
    cursor,
    isMouseFallback,
    cameraError,
    showPip,
    setShowPip,
    startCamera,
    enableMouseFallback,
    enableCameraMode,
    canvasRef,
    videoRef,
    calibration: {
      hasSeenHand,
      hasPointed,
      hasPinched,
    },
  };
}
