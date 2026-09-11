MAGIC DRAGON PIN v0.9.69 — DOCKET VIEWER + RECORDS CLEANUP

Focused release:
- Fixes the Delivery Docket viewer collapsing to a thin blank strip when a docket is selected.
- Keeps the selected docket in a stable, internally scrolling viewer beneath the selector list.
- Records group headers now use a simple right-side chevron only; stored-record count bubbles are removed.
- Preserves all v0.9.68 Sunday Reports cleanup and workflow/accounting logic.

DEPLOYMENT
Replace all 7 files in the GitHub Pages repository root, commit, wait for deployment, then confirm v0.9.69 in the header.

TEST
1. Open Delivery Dockets and tap each saved docket. Confirm the docket body and action buttons appear beneath the selector list every time.
2. Tap the selected docket again and confirm it closes cleanly.
3. Open Records and confirm Delivery dockets / Sunday reports / Invoices / Payments show only a right-side chevron, with no count bubble.
