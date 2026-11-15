<p align="center">
  <img src="docs/assets/biotesseract-logo.svg" alt="Bio-Tesseract logo" width="172" />
</p>

<h1 align="center">BIO-TESSERACT</h1>

<p align="center"><strong>Human systems × mission systems</strong></p>

<p align="center">A mission-control interface for exploring simulated astronaut biometrics, crew events, and spacecraft life-support status.</p>

<p align="center"><a href="https://github.com/Hardik-Sharma-1005/Project-Bio-Tesseract">Source repository</a> · <a href="#quick-start">Run locally</a> · <a href="#system-workflow">System workflow</a></p>

---

## Project overview

Bio-Tesseract is a browser-based astronaut health and life-support monitoring simulation. It brings a changing simulated crew feed and mission-system context into one operational dashboard, so a reviewer can move between a mission overview, individual biometrics, suit readings, medical scenarios, and crew alerts.

The project demonstrates how these views can fit together. It is a simulation: it does not connect to spacecraft hardware or provide clinical monitoring or diagnosis.

## Why it exists

Crew health and vehicle conditions are different kinds of information, but operators need to understand them in context. Bio-Tesseract presents both in a shared interface, with a clear distinction between simulated live readings and a separate historical telemetry dataset.

## Capabilities

- **Mission Overview:** derived mission status, crew snapshot, selected alert, and navigation to dashboard sections.
- **Bio-Monitor:** shared crew selection, simulated vital signs, ECG-style visualization, and historical telemetry charts when Supabase is configured.
- **Life Support:** simulated suit and life-support readings for the selected crew member.
- **Crew & Alerts:** crew roster and alert acknowledgement, selection, and resolution states.
- **Medical Advisor:** an explicitly labeled simulation that explores selected-crew readings and scenario outputs; it is not a diagnostic tool.
- **BioAstra mission copilot:** a deterministic, local command interface for supported mission queries and navigation, with confirmation for state-changing actions.
- **Interactive telemetry:** chart inspection with timestamped values, plus a connected life-systems illustration on the landing experience.
- **Shared dashboard state:** crew selection and mission events remain available as the operator changes sections.

## System workflow

The dashboard keeps generated live simulation and stored historical telemetry as separate sources. Shared application state supplies the selected simulated crew member and mission events to the operational views. BioAstra interprets supported commands against that state; historical data is fetched separately through the Supabase browser client.

<p align="center">
  <img src="docs/assets/biotesseract-workflow.svg" alt="Bio-Tesseract workflow: simulated crew and mission state feed the dashboard views; historical telemetry follows a separate Supabase read path; BioAstra interprets supported commands against shared dashboard state." width="100%" />
</p>

The editable diagram source is [`docs/architecture/biotesseract-workflow.mmd`](docs/architecture/biotesseract-workflow.mmd).

## Architecture and technology

| Area | Implementation |
| --- | --- |
| Web application | Next.js App Router and React |
| Language and styling | JavaScript, JSX, and custom CSS |
| Simulated operational state | Client-side dashboard state and generated crew readings |
| Historical telemetry | Supabase JavaScript client and the configured read-only Data API relation |
| Database | Supabase / PostgreSQL for historical telemetry only |
| Deployment | Next.js production build; no deployment provider configuration is included in this repository |

The application routes are `/` (landing experience), `/hero` (landing experience alias), and `/dashboard`. The dashboard owns shared selection, alert, and simulated anomaly state. Historical records are requested independently; the dataset has no verified crew mapping and is not presented as a selected astronaut's live feed. See [Supabase telemetry notes](file_arnav/SUPABASE_TELEMETRY_SETUP.md) for the relation, query boundaries, setup, and diagnostics.

## Repository layout

```text
Project-Bio-Tesseract/
├── README.md
├── .gitignore
├── docs/
│   ├── architecture/
│   │   └── biotesseract-workflow.mmd
│   └── assets/
│       ├── biotesseract-logo.svg
│       └── biotesseract-workflow.svg
└── file_arnav/                         # Next.js application root
    ├── app/                            # App Router pages and global styles
    ├── components/                     # Landing, dashboard, and UI sections
    ├── hooks/                          # Telemetry data hook
    ├── lib/                            # Crew data, Supabase, telemetry, BioAstra
    ├── public/                         # Static application imagery
    ├── sql/                            # Read-only telemetry diagnostics
    ├── SUPABASE_TELEMETRY_SETUP.md
    ├── .env.example
    ├── package.json
    └── package-lock.json
```

`file_arnav` is retained as the existing frontend directory because it is the configured Next.js project root for local scripts and its Turbopack configuration. No tracked Vercel project-root setting is present to confirm how a rename would affect an externally configured deployment.

## Quick start

Prerequisites: Node.js 20.9 or newer (required by the configured Next.js 16 release) and npm.

```bash
git clone https://github.com/Hardik-Sharma-1005/Project-Bio-Tesseract.git
cd Project-Bio-Tesseract/file_arnav
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The simulated dashboard can be explored without Supabase credentials; historical telemetry remains unavailable until the environment is configured.

For a production build and local production server:

```bash
npm run lint
npm run build
npm run start
```

The scripts are defined in [`file_arnav/package.json`](file_arnav/package.json), and the npm lockfile is retained for reproducible installation.

## Environment configuration

Copy [`file_arnav/.env.example`](file_arnav/.env.example) to `file_arnav/.env.local` and set the two public browser-client values from the Supabase project settings:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL used by the browser client |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key used for read-only historical telemetry requests under the project's existing access rules |

The application does not require a service-role key. `.env.local` is ignored by Git. Never put private credentials in a `NEXT_PUBLIC_` variable.

The historical source is `public."bio-tesseract-telemetry"`. This project does not create the table or change database policies. The supplied setup notes document the expected relation, access behavior, and a read-only SQL diagnostic script at [`file_arnav/sql/telemetry-read-only-diagnostics.sql`](file_arnav/sql/telemetry-read-only-diagnostics.sql).

## Data and simulation

Crew vitals, suit readings, mission events, and anomaly scenarios are generated in the browser for demonstration. They are not physical sensor measurements. Historical telemetry is a distinct Supabase-backed view of stored synthetic records; its schema does not associate records with crew members. A missing or unconfigured historical source does not prevent exploration of the simulated dashboard.

## Scope and next steps

This release demonstrates a front-end operational workflow. It has no spacecraft hardware connection, no clinical decision support, and no authenticated operator or role-management system. Historical chart samples are bounded by the client query implementation; see the telemetry setup notes for details.

Possible next steps include adding an authenticated operator workflow, documenting a verified hosted deployment, and designing a stable database-side pagination or aggregation strategy for historical charts.

## Credits and license

The repository includes its own Bio-Tesseract interface and brand assets and uses the packages listed in [`file_arnav/package.json`](file_arnav/package.json). No separate `LICENSE` file is present, so the repository's redistribution terms have not been declared here.
