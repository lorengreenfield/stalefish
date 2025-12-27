stalefish example demo

This is a minimal demo app and static server to showcase stalefish components during development, similar to the halfcab example.

Run

1. From the project root, start the server:
   node stalefish/example/server.mjs
2. Open in your browser:
   - http://localhost:5174/
   - http://localhost:5174/stalefish/example/
3. To use a different port:
   node stalefish/example/server.mjs 8080

Files

- stalefish/example/index.html — HTML shell, import map, and styles
- stalefish/example/app.mjs — Demo page that renders each stalefish component
- stalefish/example/server.mjs — Tiny Node static server (no external deps)
- stalefish/example/ssr-browser-stub.js — Browser stub for @lit-labs/ssr used by halfcab

Notes

- The import map references:
  - stalefish at /stalefish/index.mjs
  - halfcab at /halfcab/halfcab.mjs
- The server serves files relative to the project root, so both stalefish and halfcab can be imported directly.
- The demo prints simple messages to the console for some interactions (e.g., buttons, FAB).
