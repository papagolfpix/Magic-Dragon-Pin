MAGIC DRAGON PIN v0.9.58 — CORRECT SEAMLESS HEADER ARTWORK

Focused visual update only.

WHAT CHANGED
- Replaced the separate square logo + typed title/subtitle with one seamless Magic Dragon banner graphic.
- The banner occupies all available header space to the left of the version/Menu stack.
- Version and Menu stay aligned on the right.
- Existing header isolation, 5-second Menu behavior, workflows, financial logic, records, dockets and invoices are unchanged.

DEPLOYMENT
Replace all 7 files in the GitHub Pages repository root, commit, wait for Pages deployment, then reopen/reload and confirm v0.9.58 in the header.


v0.9.58 focused fixes:
- Cache-busted/network-first Magic Dragon banner asset so old square artwork cannot be served by an older service worker.
- Existing invoice remains CURRENT when a docket correction was explicitly queued to next Sunday.
- Dashboard correction alert now identifies the actual delivery date + branch instead of exposing an internal invoice ID.
