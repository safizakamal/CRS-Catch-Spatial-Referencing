export type GameStage = 
  | 'INTRO' 
  | 'CALIBRATION' 
  | 'LEVEL_1' 
  | 'LEVEL_2' 
  | 'LEVEL_3' 
  | 'SUMMARY';

export type GestureState = 
  | 'OPEN' 
  | 'HOVER' 
  | 'PINCH_START' 
  | 'GRABBED' 
  | 'PINCH_RELEASE' 
  | 'DROP';

export type TrackingStatus = 
  | 'NOT_STARTED' 
  | 'INITIALIZING' 
  | 'NO_HAND' 
  | 'HAND_DETECTED' 
  | 'PINCHING' 
  | 'ERROR' 
  | 'MOUSE_MODE';

export interface CursorPosition {
  x: number;
  y: number;
  isPinching: boolean;
  pinchDistance: number;
  rawX?: number;
  rawY?: number;
}

export type CRSType = 'GCS' | 'PCS';

export interface LearnMoreDetail {
  concept: string;
  explanation: string;
  practicalTip: string;
  keyFormulaOrFact?: string;
}

export interface Scenario {
  id: number;
  title: string;
  scenarioText: string;
  unitClue?: string;
  correctAnswer: CRSType;
  reason: string;
  hint: string;
  badge?: string;
  learnMore?: LearnMoreDetail;
}

export interface ClueInspection {
  layerName: string;
  expectedLocation: string;
  attributeSnippet: { field: string; sampleValue: string }[];
  metadataSnippet: string;
  clueObservation: string;
}

export interface DetectiveQuestion {
  id: number;
  title: string;
  question: string;
  problemDescription: string;
  mapAnomaly?: string;
  coordinatesClue?: string;
  clueInspection?: ClueInspection;
  clues?: {
    where: string;
    numbers: string;
    crs: string;
  };
  diagnosisTitle?: string;
  keyEvidence?: string;
  gisTip?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  hint: string;
  diagnosticSteps: string[];
}

export interface QuickDecisionItem {
  id: number;
  text: string;
  subtext?: string;
  correctAnswer: CRSType;
  explanation: string;
  gisTip?: string;
  learnMore?: string;
}

export interface GameStats {
  score: number;
  lives: number;
  level1Correct: number;
  level2Correct: number;
  level3Correct: number;
  streak: number;
  maxStreak: number;
}
