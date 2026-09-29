# Architecture decisions

- The deployable application is a static React + TypeScript + Vite site hosted on Vercel; it has no backend runtime or API base URL.
- The public catalogue reads a bundled metadata snapshot from `frontend/src/data/archiveData.json`.
- The snapshot is read-only and excludes OCR/transcription text, source files, and storage paths. Records are labeled as catalogued, not verified.
- Authentication, privileged edits, uploads, file streaming, processing, and model-backed research require trusted server-side services and are disabled rather than emulated in the browser.
- `archive_sources/archive_phase1.db` is retained as an offline source artifact only; builds and runtime do not read or deploy it.
