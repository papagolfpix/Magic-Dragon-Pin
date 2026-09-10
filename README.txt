MAGIC DRAGON PIN v0.9.59 — FINAL NIGHT SHELL PATCH

Focused update only.

WHAT CHANGED
- Rebuilt the normal app shell around a hard-clipped content viewport below the branded header.
- Active pages scroll inside that clipped viewport; they cannot paint into the header region.
- Menu button keeps its existing width and is now approximately square, with the version badge aligned above it.
- Sunday Workflow remains a dedicated fullscreen workflow.
- No business, reconciliation, invoice, correction, records, or product logic changed in this release.

ACCEPTANCE TEST
1. Open Dashboard on iPhone Safari.
2. Scroll rapidly to the top and bottom several times.
3. Confirm no Dashboard content appears inside/behind the black header rectangle.
4. Open Menu and confirm the version/Menu stack remains aligned.

DEPLOYMENT
Replace all 7 files in the GitHub Pages repository root, commit, wait for Pages deployment, then reopen/reload and confirm v0.9.59 in the header.
