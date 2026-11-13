# Bio-Tesseract Frontend Handoff

## Purpose

Bio-Tesseract is a frontend-only astronaut health and spacecraft life-support mission simulation. It demonstrates crew biometrics, a procedurally generated ECG-like waveform, life-support readings, a simulated medical advisor, and operational alerts. It is not a clinical monitoring system and does not integrate with real sensors or an actual AI diagnostic service.

## Repository and frontend location

- GitHub: `mayanksr2728/Project-Bio-Tesseract`
- Default branch: `main`
- Repository checkout root contains a `Project-Bio-Tesseract/` subdirectory.
- Next.js frontend: `Project-Bio-Tesseract/file_arnav/`
- Other repository-root files include the separate Node service, database, telemetry and ML material. Keep those outside frontend changes unless specifically requested.
- Configure Vercel Root Directory as `Project-Bio-Tesseract/file_arnav` (relative to the Git repository root).

## Stack and versions

- Next.js `16.4.6` (Active LTS at time of this handoff)
- React and React DOM `19.3.1`
- JavaScript / JSX, App Router, CSS, canvas
- ESLint `9.39.5`, `eslint-config-next` `16.4.6`
- Node used for this verification: `24.19.0`; Next 16 requires Node 20.9 or newer.
- No extra runtime UI or animation dependencies were added.

## Important frontend files

- `app/page.js`: client dashboard shell, section routing, shared crew/alert state, telemetry drift, anomaly simulation, mobile navigation state, cursor glow listener.
- `app/layout.js`: document layout and page metadata.
- `app/global.css`: theme tokens, common controls, responsive rules, reduced-motion behavior, transitions and pointer glow.
- `components/shell/Navbar.jsx`: mission header, clocks, crew selection and anomaly toggle.
- `components/shell/Sidebar.jsx`: five-section navigation.
- `components/overview/OverviewSection.jsx`: mission overview, crew summaries, biometrics, ECG preview, life-support and advisor summaries, alerts.
- `components/biomonitor/BioMonitorSection.jsx` and `components/biomonitor/LiveEcgChart.jsx`: astronaut metrics and procedural waveform visualization.
- `components/lifesupport/LifeSupportSection.jsx`: astronaut suit and environmental demonstration parameters.
- `components/medical/MedicalSection.jsx`: simulated analysis, scan history and suggested actions.
- `components/crew/CrewSection.jsx`: crew profiles, comparison and acknowledgement-capable alerts.
- `lib/data/crew.js`: shared initial crew and alert fixtures (the main page currently declares its own initial state values).

## Sections and shared state

The five primary section IDs are `overview`, `biomonitor`, `lifesupport`, `medical`, and `crew`. The parent component in `app/page.js` owns the crew list, selected astronaut, active section, alarm state and alert feed. It passes those values and callbacks to the sections, so astronaut selection and anomaly values are shared across the UI.

Crew telemetry drifts slightly every 2.5 seconds. While the simulated anomaly is active for the selected astronaut, the drift skips that astronaut. The anomaly raises heart rate to 125 BPM and stress to 78%, marks the status Warning and creates a critical alert. Switching it off restores that astronaut's original heart-rate and stress baseline and nominal status. Alerts can be acknowledged in the crew section and overview feed.

The ECG and values are illustrations. The waveform updates through a canvas animation loop which is cancelled when its component unmounts or its dependencies change. Do not describe the readings as clinically validated.

## Design and interactions

- Near-black navy surfaces, restrained cyan accents and green/amber/red status colors.
- System font stacks (no external font download required).
- Increased body text contrast and spacing, responsive padding and existing section-specific grid breakpoints.
- Subtle pointer-following cyan background glow on fine-pointer devices, disabled for coarse pointers and reduced motion.
- Small entrance and hover feedback; reduced-motion settings disable animation and transitions.

## Dependencies and configuration

- `package.json` and `package-lock.json` are the frontend dependency source of truth.
- `next.config.js` enables React Strict Mode. The obsolete `swcMinify` option was removed for Next 16.
- `eslint.config.mjs` uses Next core web-vitals flat configuration. Run `npm run lint`.
- No frontend environment variables are required. There are no secrets or `.env` files in the frontend.
- No `vercel.json` is needed for this standard App Router deployment.

## Vercel deployment

| Setting | Value |
| --- | --- |
| Repository | `mayanksr2728/Project-Bio-Tesseract` |
| Framework | Next.js |
| Root Directory | `Project-Bio-Tesseract/file_arnav` |
| Install | `npm install` (Vercel detects the npm lockfile) |
| Build | `npm run build` |
| Output | Default Next.js output |
| Production branch | `main` |

The frontend builds from its own directory and does not import repository-root backend or ML files.

## Commands

Run these from `Project-Bio-Tesseract/file_arnav/`:

```sh
npm install
npm run dev
npm run lint
npm run build
npm run start
```

## Changes made in this task

- Removed the Tesseract page, canvas components, navigation entry, overview preview, associated alert wording and stale duplicate sidebar entry. The Bio-Tesseract product name remains.
- Kept the five requested sections and existing shared simulation architecture.
- Restyled the common UI for higher readability and added the restrained pointer glow, responsive refinements, hover/entrance feedback and reduced-motion support.
- Removed remote font imports and their external runtime dependency.
- Upgraded Next.js to 16.4.6 and React/React DOM to 19.3.1; updated the npm lockfile and ESLint setup.
- Removed the unsupported `swcMinify` setting and migrated lint from removed `next lint` to ESLint 9.
- Fixed the synchronous UTC clock state update flagged by the current React lint rules.
- No commits, pushes, branch changes, merges, or deployments were made.

## Verification and limitations

- `npm run lint`: passed.
- `npm run build`: passed; `/`, `/_not-found`, and `/dashboard` prerender successfully.
- Local production server started successfully. The Codex in-app browser timed out connecting to localhost, so no visual browser inspection, mobile viewport inspection, hydration-console check, or direct click-through of the five sections was completed.
- Source references were checked: no Tesseract feature implementation or navigation references remain in the frontend; remaining `Bio-Tesseract` occurrences refer only to the retained project name.
- Shared simulation behavior was preserved by inspection, but anomaly toggling, alert acknowledgement and astronaut switching were not exercised in a browser.
- Vercel itself was not connected to and no deployment was performed.

## Remaining work and contributor notes

- Before publishing, visually inspect desktop, tablet and mobile layouts and click through section navigation, crew switching, the anomaly toggle and alert acknowledgement in a browser.
- Review the generated changes and decide what to commit/push; this handoff and all code changes remain uncommitted.
- Keep simulated data clearly labeled, avoid implying real medical/AI/sensor capability, and keep the frontend independently buildable from its configured Vercel root.
