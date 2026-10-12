# CRS Catch! — Spatial Referencing 🌍

An interactive, gesture-controlled GIS educational web game designed for Bachelor of Computer Science students learning Geographic Information Systems (GIS) concepts (Week 3 — LOCATE: Spatial Referencing).

Students distinguish between **Geographic Coordinate Systems (GCS)** and **Projected Coordinate Systems (PCS)**, investigate realistic GIS layer displacement anomalies in **CRS Detective**, and test their decision speed under timed pressure in **Rapid Decision**.

---

## 🚀 Key Features

- **Level 1 — RECOGNISE (Explore & Sort)**: Interactive gesture drag-and-drop sorting of GIS scenario cards into GCS vs PCS categories with educational explanations.
- **Level 2 — INVESTIGATE (CRS Detective)**: Case file investigation diagnosing real spatial referencing issues (displaced layers, Null Island, off-the-coast anomalies, swapped axes, on-the-fly projections).
- **Level 3 — DECIDE (Rapid Decision)**: Timed 5-second GIS decision rounds using mouse/touch with separated reading and decision time.
- **MediaPipe Hand Tracking**: In-browser computer vision tracking (move, pinch to grab, release to drop, pinch-and-hold to continue) with zero backend, database, or paid API dependencies.
- **Mouse & Touch Fallback**: 100% usable on mobile devices, laptops without webcams, or environments with restricted camera access.
- **Static Single-Page Application**: Deployable directly to GitHub Pages, static web hosts, or embedded inside Moodle LMS.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📦 Building for Production

To create a static production build:

```bash
npm run build
```

The production output is generated in the **`dist`** folder.

### Base Path Configuration
- By default, `npm run build` is pre-configured with `base: '/crs-catch/'` for GitHub Pages hosting at `https://<your-username>.github.io/crs-catch/`.
- If you deploy to a custom domain or the root of a domain, override the base path using the `VITE_BASE_PATH` environment variable:
  ```bash
  VITE_BASE_PATH=/ npm run build
  ```

---

## 🌐 Deploying to GitHub Pages

This repository includes an automated GitHub Actions deployment workflow in `.github/workflows/deploy.yml`.

### Step-by-Step Publishing Guide:

1. **Create GitHub Repository**:
   - Create a new public repository on GitHub named:
     ```
     crs-catch
     ```

2. **Push Your Code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of CRS Catch!"
   git branch -M main
   git remote add origin https://github.com/<your-username>/crs-catch.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Navigate to **Settings** > **Pages** (under the "Code and automation" section).
   - Under **Build and deployment** > **Source**, select **`GitHub Actions`**.

4. **Automatic Deployment**:
   - Every time you push to the `main` branch (or run the workflow manually via the **Actions** tab), GitHub Actions will:
     1. Install dependencies
     2. Build the application with `VITE_BASE_PATH=/crs-catch/`
     3. Deploy the `dist` folder to GitHub Pages
   - Your application will be live at:
     ```
     https://<your-username>.github.io/crs-catch/
     ```

---

## 🎓 Embedding in Moodle LMS

The application is fully compatible with Moodle iframe embedding (via Moodle Page, Book, or HTML Block).

### Moodle Iframe Code Snippet:

```html
<iframe 
  src="https://<your-username>.github.io/crs-catch/" 
  width="100%" 
  height="750" 
  style="border: none; border-radius: 12px; min-height: 600px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" 
  allow="camera; microphone; fullscreen; display-capture" 
  allowfullscreen>
</iframe>
```

### Important Camera Permissions in Iframes:
- Browsers require the `allow="camera"` attribute on the `<iframe>` tag for webcam access inside embedded frames.
- Both Moodle and GitHub Pages must be served over **HTTPS** for browser camera permissions to be granted.
- If a student's browser or LMS security settings block camera access, the game will automatically display a polite status notification and transition into **Mouse & Touch Mode** without interrupting gameplay.

---

## 🔒 Security & Privacy

- **100% Client-Side**: All video frames are processed locally in the user's browser using MediaPipe WebAssembly. No video, images, or telemetry are ever sent to an external server.
- **Zero Paid Cloud / API Dependencies**: No backend database, Google Cloud billing, or LLM tokens required.
