# Ambedkar Digital Heritage Archive

A static, read-only archive catalogue built with React, TypeScript, and Vite. The application bundles a metadata snapshot and deploys as a frontend-only site to Vercel; it does not require a Python service, database connection, API credentials, or environment variables.

## What the static site provides

- Browse the bundled collection, document, media, and knowledge-graph metadata.
- Search catalogue metadata in the browser.
- Explore public catalogue routes and kiosk views.
- See clear notices wherever an operation requires server-side authentication, storage, processing, or editing.

The bundled records are marked as catalogued metadata, not independently source-verified. The export excludes OCR/transcription text and storage paths. No document or media files are hosted by this frontend. There is no login, staff role, write operation, live integrity check, AI research answer, or server-backed processing.

## Requirements

- Node.js 20.19+ (or 22.12+)
- npm 10+

## Local development

From the repository root:

```bash
npm run setup
npm run dev
```

Vite serves the app at `http://localhost:5173`.

Useful commands:

```bash
npm run build    # Type-check and create frontend/dist
npm run preview  # Serve the production build locally
npm run verify   # Check the production output and bundled catalogue
npm run lint     # Run Oxlint
```

The frontend can also be used directly from `frontend/` with `npm ci`, `npm run dev`, and `npm run build`.

## Deploy to Vercel

Import this repository into Vercel and use the checked-in `vercel.json` configuration. It installs the frontend lockfile, builds the Vite app, publishes `frontend/dist`, and routes SPA paths to `index.html`. No environment variables are required.

## Data snapshot

`frontend/src/data/archiveData.json` is the static catalogue data source. To refresh it, update the snapshot from an approved, trusted source and preserve the privacy/content exclusions and catalogue-status labeling. Do not include source text, restricted data, credentials, local storage paths, or claims of verification without the relevant review. The retained original archive database in `archive_sources/` is not used at build or runtime.

## Project layout

```text
frontend/              React + TypeScript application and Vite configuration
  src/data/            Bundled catalogue metadata
  src/pages/           Public catalogue pages
  src/services/        Browser-side static data adapters
scripts/               Setup, preflight, and static build verification
archive_sources/       Preserved source database; not part of the deployed app
vercel.json            Static Vercel build and SPA routing
```
