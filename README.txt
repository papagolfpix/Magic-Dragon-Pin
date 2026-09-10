MAGIC DRAGON PIN v0.9.41 — SIMPLE DOCKET CORRECTIONS

Post-delivery docket corrections now require one of two choices directly on Edit Docket: Update this invoice, or Add to next Sunday’s invoice. The choice is locked at save and processed automatically. Invalid reconciliation never produces a partial/false money difference. Next-Sunday corrections auto-populate into the next Sunday workflow and invoice with a short explanation. Historical dockets already used by completed invoices are inferred as Delivered.

New in this build:
- saved invoice versions remain immutable
- source-data changes show a clear saved-vs-recalculated difference
- revised invoices create a new version instead of overwriting the original
- sent/paid revisions can create a one-time positive or negative adjustment
- pending adjustments appear in Dashboard Attention only when needed
- next eligible Sunday Financial step asks Pin to Apply this Sunday or Leave for later
- carried adjustments appear separately from current-week trading and change only the settlement total
- pending adjustments can also be marked handled separately
- one-time application is tracked to prevent accidental double carry-forward

Deploy all 7 files to the GitHub Pages repository root, commit, wait for Pages, open the app, tap Refresh App, and confirm v0.9.41.