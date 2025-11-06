# Bundle Review & Code Splitting — Phase 3 (2025-11-06)

## Method

- Ran `npm run build` before and after configuring Rollup manual chunks.
- Compared generated asset sizes under `frontend/dist/assets`.
- Focused on separating heavyweight third-party libraries (Skulpt, Sandpack, DnD Kit, Framer Motion, React/Router).

## Results

| Chunk | Before | After | Notes |
| --- | --- | --- | --- |
| Main bundle (`index-*.js`) | 2.33 MB | 420 KB | Core app code now excludes large vendor packages. |
| Skulpt runtime | bundled | 949 KB (`skulpt-*.js`) | Dedicated chunk isolates Python runtime; consider lazy-loading on demand. |
| Sandpack | bundled | 635 KB (`sandpack-*.js`) | Still over 500 KB; evaluate dynamic import around playground routes. |
| React core | bundled | 141 KB (`react-*.js`) | Split into its own vendor chunk via manual configuration. |
| DnD Kit | bundled | 48 KB (`dndkit-*.js`) | Separate chunk supporting formative assessments. |
| Framer Motion | bundled | 114 KB (`motion-*.js`) | Isolated for celebratory animations and micro-interactions. |

## Next Steps

- Investigate route-level `lazy()` imports for the Python playground and Sandpack-powered experiences to avoid loading heavy chunks for general navigation.
- Add a runtime bundle analyzer (e.g., `rollup-plugin-visualizer`) during CI to watch future regressions.
- Monitor Lighthouse performance once GUI access is available; expect faster initial load for non-programming routes after the split.

## Commands

```bash
cd frontend
npm run build
```
