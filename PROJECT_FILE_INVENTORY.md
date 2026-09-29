# Project file inventory

The active application is a static React/Vite frontend. The backend runtime and its Python dependencies have been removed from the project; the original SQLite source database is preserved separately and is not used by the app.

## Required project files

```text
package.json
package-lock.json
.nvmrc
.gitignore
.gitattributes
.editorconfig
README.md
DECISIONS.md
PROJECT_FILE_INVENTORY.md
vercel.json
scripts/preflight.mjs
scripts/setup.mjs
scripts/verify.mjs
frontend/package.json
frontend/package-lock.json
frontend/index.html
frontend/vite.config.ts
frontend/tsconfig*.json
frontend/src/**
frontend/public/**
```

The frontend source includes the React entry points, localization, archive/catalogue pages, static data adapters, UI components, styles, and the bundled `frontend/src/data/archiveData.json` catalogue snapshot. Vercel builds and publishes only `frontend/dist`.

## Preserved but not deployed or used at runtime

```text
archive_sources/archive_phase1.db
```

This source database is retained for data provenance and possible future approved snapshot updates. It is not an API, build input, or deployed frontend asset. Do not move it into `frontend/public/` or bundle it with the client application.

## Generated or local-only files

```text
.git/
node_modules/
frontend/node_modules/
frontend/dist/
frontend/tsconfig*.tsbuildinfo
```

Recreate dependencies and build output from the checked-in package manifests and lockfiles. Local environment files and secrets should not be committed; the static app currently requires no environment variables.

## Removed from the deployment project

- Python/FastAPI backend source and requirements
- SQLite runtime/API wiring
- Starter-template assets that were not referenced

Server-dependent functions (authentication, write access, file delivery, OCR/transcription, live integrity checks, and AI research) are intentionally unavailable in this static deployment rather than simulated.
