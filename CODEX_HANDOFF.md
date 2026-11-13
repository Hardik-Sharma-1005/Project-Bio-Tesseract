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

- `app/page.js`: client dashboard shell, section routing, shared crew/alert state, telemetry drift, astronaut-bound anomaly state, derived mission status, mobile navigation state, cursor glow listener.
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

The five primary section IDs are `overview`, `biomonitor`, `lifesupport`, `medical`, and `crew`. The parent component in `app/page.js` owns the crew list, selected astronaut, active section, affected anomaly astronaut ID, associated critical alert ID and alert feed. It passes shared state and callbacks to the sections, so astronaut selection and anomaly values remain consistent across the UI.

Crew telemetry drifts slightly every 2.5 seconds. Drift values are generated once per interval tick, outside the React state updater, to keep updater behavior stable under Strict Mode. While an anomaly is active, drift skips the stored affected astronaut even if the selected astronaut changes. The anomaly raises that person's heart rate to 125 BPM and stress to 78%, marks Warning and creates an associated critical alert. Clearing it restores the affected person's original baseline and marks the associated alert resolved. Acknowledging an alert only records acknowledgement; it does not resolve its condition. Mission status is derived consistently as CRITICAL for an active critical anomaly/alert, CAUTION for an unresolved caution or crew warning, and NOMINAL otherwise. The initial solar-particle caution remains active, so initial mission status is CAUTION.

The ECG and values are illustrations. Bio-Monitor labels drifting demo vitals separately from fixed illustrative ECG intervals, ST deviation, cardiac output and stroke volume. PPG is a separate waveform mode rather than an ECG lead. Canvas charts render a static procedural waveform for reduced-motion preference and pause while the document is hidden; frame callbacks and listeners are cleaned up on unmount. Do not describe the readings as clinically validated.

## Design and interactions

- Near-black navy surfaces, restrained cyan accents and green/amber/red status colors.
- System font stacks (no external font download required).
- Increased body text contrast and spacing, responsive padding and existing section-specific grid breakpoints.
- Subtle pointer-following cyan background glow on fine-pointer devices, disabled for coarse pointers and reduced motion.
- Small entrance and hover feedback; reduced-motion settings disable animation and transitions.

## Dependencies and configuration

- `package.json` and `package-lock.json` are the frontend dependency source of truth.
- `next.config.js` enables React Strict Mode. The obsolete `swcMinify` option was removed for Next 16.
- The frontend build script uses the supported `next build --webpack` option. Next 16's default Turbopack build intermittently returned a Windows `EPERM` while creating a generated `/_not-found` segment directory in this workspace; the Webpack build completed consistently.
- `eslint.config.mjs` uses Next core web-vitals flat configuration. Run `npm run lint`.
- `next.config.js` pins the Turbopack workspace root to this frontend directory so an unrelated parent lockfile does not affect frontend builds.
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
- Bound anomaly state to its original astronaut and resolved its alert when cleared; derived a shared mission status from unresolved alerts and crew status.
- Labeled Bio-Monitor measurements and procedural waveforms accurately, separated ECG lead modes from PPG, and added reduced-motion/static and hidden-tab chart behavior.
- Added scan timer cleanup and accurate local-only protocol confirmations in the medical simulation.
- Made overview and crew selection cards semantic keyboard-operable buttons with `aria-pressed`.
- Replaced the nested frontend README with current application, setup, simulation and Vercel information. Removed unused legacy navbar, sidebar, footer, advisor and root-level ECG components after confirming they had no frontend imports; the active chart remains under `components/biomonitor/`.
- Switched the frontend production build script to Next's supported Webpack build option after reproducing intermittent Turbopack `EPERM` failures in generated Windows output.
- No commits, pushes, branch changes, merges, or deployments were made.

## Verification and limitations

- `npm run lint`: passed.
- `npm run build`: passed using the Webpack build script; `/`, `/_not-found`, and `/dashboard` prerender successfully.
- The Codex in-app browser could not connect to the local app, so no visual browser inspection, mobile viewport inspection, hydration-console check, or direct click-through of the five sections was completed.
- Source references were checked: no Tesseract feature implementation or navigation references remain in the frontend; remaining `Bio-Tesseract` occurrences refer only to the retained project name.
- The anomaly and status state transitions were reviewed in source, but astronaut switching, alert acknowledgement, scan timer behavior and protocol interactions were not exercised in a browser.
- Vercel itself was not connected to and no deployment was performed.

## Remaining work and contributor notes

- Before publishing, visually inspect desktop, tablet and mobile layouts and click through section navigation, crew switching, the anomaly toggle, alert acknowledgement, chart modes, scan cancellation and protocol selection in a browser.
- Review the generated changes and decide what to commit/push; this handoff and all code changes remain uncommitted.
- Keep simulated data clearly labeled, avoid implying real medical/AI/sensor capability, and keep the frontend independently buildable from its configured Vercel root.
