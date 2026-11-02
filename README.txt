MAGIC DRAGON PIN — v0.10.136 DEPLOY
2 November 2026

SUNDAY RECONCILIATION CORRECTION
- Previous Sunday stock is matched by exact product name AND canonical variant ID.
- Never reuse an approximate/fuzzy similarly named 5g or Pre-Roll row as 1g stock.
- A product absent from the prior report and opening at zero may return normally;
  its recorded deliveries and closing balance must still agree.
- All stock-flow names and reconciliation warnings display explicit variants,
  e.g. "Super Lemon Haze · 1g" versus "Super Lemon Haze · 5g".
- No historical Sunday figures, product aliases, deliveries, invoices or payments
  are changed by this software update.

TARGETED VERIFIED CASE (from provided backup, not included in this ZIP)
- BM Bangrak, Sunday 2026-11-01 versus 2026-10-25.
- Super Lemon Haze 1g: absent from 2026-10-25, previous 2026-10-11 close 0.
- 2026-11-01: opening 0 + 30 delivered - 0 sold = 30 close.
- Super Lemon Haze 5g: 1 + 4 - 1 = 4; Pre-Roll: 0 + 10 - 0 = 10.
- Corrected stock and financial wizard should unlock if no other issues.

INSTALLATION
- Save a fresh Complete App Data backup to Files (outside Safari) first.
- For PRODUCTION deploy v0.10.136 DEPLOY to the Magic-Dragon-Pin production
  repository using the existing process. Do not use the TEST extractor workflow
  for a DEPLOY ZIP.
- For isolated validation deploy the TEST ZIP to the TEST repository only.
- Refresh app, verify "v0.10.136 DEPLOY" in header, re-open Sunday's workflow.
- Never clear browser/site data; do not reimport original Sunday spreadsheets.
- Keep existing data; do not import test data on Pin's phone.

TESTS
- JavaScript syntax and offline forensic reconciliation against user backup.
- Static HTML, JavaScript and service-worker cache version consistency.
- Isolated headless JavaScript tests for cross-variant and missing-row cases.
- iPhone Safari end-to-end UX and deploy were not run in this environment.

PACKAGE
- App-only root files. No private shop, invoice or backup information included.
- v0.10.135 production source remains rollback reference.
