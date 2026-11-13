# Project Bio-Tesseract

Bio-Tesseract is a frontend demonstration of an aerospace mission-control health dashboard. It presents simulated astronaut biometrics, procedural ECG and PPG waveforms, life-support readings, a simulated medical-advisor workflow, and crew alerts.

This is not a medical device. Values are illustrative simulation data and do not come from astronauts, sensors, a validated diagnostic model, or spacecraft hardware. Protocol buttons only update local interface state.

## Application sections

1. **Mission Overview** — crew summaries, selected astronaut, waveform preview, life-support summary, advisor preview and alerts.
2. **Bio-Monitor** — simulated biometrics and procedural ECG/PPG display modes.
3. **Life Support** — illustrative suit and spacecraft environment readings.
4. **AI Medical Advisor** — a simulated scan, history and protocol selection workflow.
5. **Crew & Alerts** — crew profiles, status and acknowledgeable alert history.

The simulated anomaly can raise the selected astronaut's heart rate and stress and create a critical alert. Its affected astronaut stays fixed until the scenario is cleared. Acknowledging an alert does not resolve the underlying condition.

## Technology

- Next.js 16.4.6 App Router
- React and React DOM 19.3.1
- JavaScript / JSX and CSS
- Canvas-based procedural waveform displays
- ESLint 9 with the Next.js core web-vitals configuration

## Requirements and local development

Use Node.js 20.9 or newer and npm.

```sh
cd Project-Bio-Tesseract/file_arnav
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality commands

```sh
npm run lint
npm run build
npm run start
```

## Vercel

Connect the `mayanksr2728/Project-Bio-Tesseract` GitHub repository. Set Root Directory to `Project-Bio-Tesseract/file_arnav`, framework to Next.js and production branch to `main`. Use the lockfile-based install and `npm run build`; keep the default Next.js output directory. The frontend requires no environment variables and does not depend on files outside its Root Directory.

## Project layout

The frontend source and package files are in `file_arnav/`. `app/page.js` owns shared crew, anomaly, alert, mission-status and section-selection state. Components are grouped by shell, overview, biomonitor, life support, medical advisor and crew responsibilities. The separate repository-root Node.js, database, telemetry and ML parts are outside this frontend application.
