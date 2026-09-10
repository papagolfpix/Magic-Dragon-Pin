MAGIC DRAGON PIN v0.9.60 — DOCKET PDF + COMPACT DASHBOARD

WHAT CHANGED
- Delivery dockets now create a real PDF file directly, using the same iPhone share/download approach as invoices.
- Removed dependence on the browser print-preview path that could produce a blank docket.
- Post-delivery history remains optional when creating the docket PDF.
- Dashboard controls, metrics and alerts are substantially more compact.
- Static branch/split information is moved behind a small Business setup disclosure instead of occupying the main dashboard.
- No reconciliation, pricing, split, invoice, correction, or import logic changed.

TEST
1. Open Dashboard and confirm it is visibly more compact.
2. Open Delivery Docket, select a saved docket, tap Create / Share PDF.
3. On iPhone confirm the share sheet receives one populated PDF file (not a blank print preview).
4. Open/save the PDF and confirm product rows, quantities, cost/retail, total, branch and date are present.

DEPLOYMENT
Replace all 7 files in the GitHub Pages repository root, commit, wait for deployment, then confirm v0.9.60 in the header.
