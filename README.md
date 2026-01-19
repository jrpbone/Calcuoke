# Calcuoke

## Overview

### Project overview

Calcuoke is a React + Vite single-page app for assembling karaoke system builds, tracking sales records, and managing component inventory. It supports an online API mode and a local simulation mode using browser storage.

### What the application does

- Builds a karaoke system configuration from inventory categories and totals the cost.
- Registers a sale with buyer details, invoice data, and optional photos.
- Maintains a component catalog with CRUD, search, and sorting.
- Tracks hardware swaps and produces warranty certificates.

### Primary use cases

- Assemble a new karaoke set and record a sale.
- Manage component inventory and pricing.
- Review customer records, photos, and swap history.
- Generate warranty certificates and replacements ledger views.

### Target users

- Sales or operations staff recording karaoke system transactions.
- Inventory managers maintaining hardware catalog data.
- Service or support staff tracking replacements and swaps.

### Key features

- Online or simulation data mode with localStorage fallback.
- Warranty certificate generation (print or PDF).
- Swap workflow with same-model and alternative selection.
- Photo upload with client-side compression.

## Tech Stack (verified only)

### Programming languages

- TypeScript (TSX for UI components).
- JavaScript runtime (browser).
- HTML and CSS (index.html with Tailwind utility classes).

### Frameworks and libraries

- React 19 and ReactDOM.
- Vite (dev server and build).
- Tailwind CSS via CDN in `index.html`.
- html2pdf.js via CDN for PDF export.
- Material Symbols and Space Grotesk (Google Fonts).

### Tools and dependencies

- Node.js and npm for scripts and dependency management.
- concurrently and nodemon for dev workflow.
- TypeScript and ESLint for type checking and linting.
- Express, mysql2, cors, body-parser (declared dependencies; backend code is not in this repo).

## File-by-File Breakdown

### Directory tree overview

```text
.
├─ components/
│  ├─ assemble/
│  └─ dashboard/
├─ data/
├─ docs/
├─ hooks/
├─ lib/
├─ pages/
├─ node_modules/
├─ App.tsx
├─ CHANGELOG.md
├─ README.md
├─ calcuoke.zip
├─ index.html
├─ index.tsx
├─ main.tsx
├─ metadata.json
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ types.ts
└─ vite.config.ts
```

### Root files

| Path                  | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `.gitignore`        | Git ignore rules for local artifacts.                              |
| `App.tsx`           | Top-level application component, view routing, and handler wiring. |
| `CHANGELOG.md`      | Versioned change log.                                              |
| `README.md`         | Project documentation.                                             |
| `calcuoke.zip`      | Archive file; not referenced by the app.                           |
| `index.html`        | HTML shell, Tailwind CDN, fonts, and html2pdf script tags.         |
| `index.tsx`         | React entry point (duplicates `main.tsx`).                       |
| `main.tsx`          | React entry point used by Vite.                                    |
| `metadata.json`     | App metadata (name/description); not referenced in code.           |
| `package.json`      | Scripts and dependency manifest.                                   |
| `package-lock.json` | npm dependency lockfile.                                           |
| `tsconfig.json`     | TypeScript compiler configuration.                                 |
| `types.ts`          | Type definitions (appears duplicate of `data/types.ts`).         |
| `vite.config.ts`    | Vite dev server and plugin configuration.                          |

### components/

| Path                                 | Purpose                        |
| ------------------------------------ | ------------------------------ |
| `components/LoadingState.tsx`      | Loading spinner for data sync. |
| `components/NotificationStack.tsx` | Toast notification UI.         |
| `components/Sidebar.tsx`           | Navigation and theme toggle.   |

### components/assemble/

| Path                                              | Purpose                                |
| ------------------------------------------------- | -------------------------------------- |
| `components/assemble/AssembleHeader.tsx`        | Assemble page header and CTA.          |
| `components/assemble/CategoryCard.tsx`          | Category selector card for components. |
| `components/assemble/ImagePreviewModal.tsx`     | Lightbox for component images.         |
| `components/assemble/SaleRegistrationModal.tsx` | Sale registration and summary modal.   |
| `components/assemble/TotalCostCard.tsx`         | Total cost summary card.               |

### components/dashboard/

| Path                                           | Purpose                                              |
| ---------------------------------------------- | ---------------------------------------------------- |
| `components/dashboard/PhotoPreviewModal.tsx` | Lightbox for record photos.                          |
| `components/dashboard/ProjectList.tsx`       | Project list view and summary cards.                 |
| `components/dashboard/ProjectSearch.tsx`     | Search input for projects.                           |
| `components/dashboard/SwapConfirmModal.tsx`  | Swap confirmation modal.                             |
| `components/dashboard/SwapFlowModal.tsx`     | Swap flow selection and registration UI.             |
| `components/dashboard/WarrantyViewer.tsx`    | Warranty certificate display, print, and PDF export. |

### data/

| Path                  | Purpose                                                                  |
| --------------------- | ------------------------------------------------------------------------ |
| `data/SeedData.tsx` | Initial components list and empty projects seed.                         |
| `data/types.ts`     | Core domain types (Category, ComponentItem, KaraokeProject, SwapRecord). |

### docs/

| Path                              | Purpose                                             |
| --------------------------------- | --------------------------------------------------- |
| `docs/App.txt`                  | Text description of `App.tsx`.                    |
| `docs/data_SeedData.txt`        | Text description of `data/SeedData.tsx`.          |
| `docs/data_types.txt`           | Text description of `data/types.ts`.              |
| `docs/lib_api.txt`              | Text description of `lib/api.ts`.                 |
| `docs/main.txt`                 | Text description of `main.tsx` and `index.tsx`. |
| `docs/pages_Assemble.txt`       | Text description of `pages/Assemble.tsx`.         |
| `docs/pages_ComponentsList.txt` | Text description of `pages/ComponentsList.tsx`.   |
| `docs/pages_Dashboard.txt`      | Text description of `pages/Dashboard.tsx`.        |
| `docs/pages_Replacements.txt`   | Text description of `pages/Replacements.tsx`.     |

### hooks/

| Path                          | Purpose                                           |
| ----------------------------- | ------------------------------------------------- |
| `hooks/useAppData.ts`       | Data sync and CRUD state for components/projects. |
| `hooks/useNotifications.ts` | Toast notification state and timers.              |
| `hooks/useTheme.ts`         | Dark/light theme state stored in localStorage.    |

### lib/

| Path           | Purpose                                                               |
| -------------- | --------------------------------------------------------------------- |
| `lib/api.ts` | API client with online/simulation modes and localStorage persistence. |

### pages/

| Path                         | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `pages/Assemble.tsx`       | Build flow and sale creation.            |
| `pages/ComponentsList.tsx` | Inventory catalog management.            |
| `pages/Dashboard.tsx`      | Project records, swaps, warranty viewer. |
| `pages/Replacements.tsx`   | Aggregated swap history ledger.          |

### node_modules/

| Path              | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `node_modules/` | Local dependency tree (generated by npm). |

## Application Flow

### High-level design

- `App.tsx` holds the current view and wires data/handlers to page components.
- `useAppData` orchestrates API or localStorage data access.
- `useNotifications` provides transient UI feedback across views.

### How components interact

- `Sidebar` changes `currentView` to render `Dashboard`, `Assemble`, `ComponentsList`, or `Replacements`.
- `Dashboard` reads project data, manages swaps, and launches the warranty viewer.
- `Assemble` builds a component set, calculates totals, and submits a new project.
- `ComponentsList` provides CRUD and validation for inventory items.

### Data flow

- On load, `useAppData` calls `ApiService.checkStatus()` and sets `dbStatus` to online or simulation.
- In simulation mode, components/projects are read and written to `localStorage` (`calcuoke_components`, `calcuoke_projects`).
- CRUD actions update local state first and persist via `ApiService`.
- Swap actions append `swapHistory`, replace a component, and remove player inventory items when swapped.

### Important business logic

- Grade is assigned by total cost: over 75000 is "Premium Setup", otherwise "Standard Commercial".
- Invoice IDs are prefixed by type; `PAPER` uses `PAPER-VOID`.
- Swap eligibility: players anytime; other categories only within 7 days of sale; chassis cannot be swapped.
- Warranty terms: player/amplifier/TV use a 90-day service term; mic uses 7-day exchange; chassis has no warranty.
- Sale photos are compressed client-side to reduce localStorage usage.

### Error handling and logging

- `useAppData` and `ApiService` throw errors that are displayed as toast notifications.
- `lastError` is stored in state but not rendered in the UI.
- Persistent logging and log storage are not defined in code.


## Setup Instructions (only if defined)

### Prerequisites

- Node.js and npm.

### Installation

```bash
npm install
```

### Running the application

```bash
npm run client
```

The Vite dev server is configured to run on port 5173.

```bash
npm run dev
```

Runs both `npm run client` and `npm run server` (see limitations about missing backend).

### Environment configuration

- `lib/api.ts` defines `API_BASE_URL` and must be edited to point at a different backend.
- `vite.config.ts` sets the dev server host/port and `tsconfig.json` controls TypeScript compiler options.

### Usage

- Use the sidebar to switch between Dashboard, Assemble, Components, and Replacements.
- Assemble a build, register the sale, then review it on the Dashboard for warranty and swaps.

## Limitations

### Limitations and known issues

- Backend server code is not present; `npm run server` expects `server.js`.
- `index.html` loads both `main.tsx` and `index.tsx` and references `/index.css`, which is not in the repo.
- `types.ts` duplicates `data/types.ts` and appears unused by imports.
- `.env.local` contains a key that is never read by the client code.
- `docs/*.txt` are static notes and may drift from the source.
- `node_modules/` is checked into the repository, which is not typical for source control.

### Future improvements

Not defined in code.

### License

Not specified.
