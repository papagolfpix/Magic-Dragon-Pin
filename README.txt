MAGIC DRAGON PIN v0.6.0 — EXCEL RECONCILIATION BUILD

MAJOR CHANGES
- Existing Magic Dragon logo enlarged to nearly fill the dark header.
- Embedded base64 logo removed from index.html and replaced with the real Magic-Dragon-logo.jpeg asset.
  This substantially reduces index.html size and removes redundant embedded image data.
- Sunday page renamed "Sunday Report Import".
- Screenshot OCR moved into a collapsed "Screenshot OCR — Backup Method" section.
- Excel remains the default Sunday workflow.
- New Independent Reconciliation runs immediately after each Excel import:
  * workbook arithmetic check
  * previous Sunday closing vs current Sunday opening
  * shop-reported deliveries vs Magic Dragon recorded delivery ledger
  * catalogue product matching
- Missing independent history is NEVER treated as a successful reconciliation.
- Delivery-ledger mismatches are distinguished from stock/arithmetic errors.
- Archive now shows each report's reconciliation status.
- Master Workbook Index now includes reconciliation status.
- Audit logic improved for Excel-imported records.
- Superseded OCR code and obsolete OCR toggle code removed.

IMPORTANT RECONCILIATION BEHAVIOUR
A first imported workbook is normally a BASELINE. It cannot be called fully reconciled against an earlier week until an earlier Sunday report exists in the app.
If the shop workbook reports a delivery that does not exist in Magic Dragon's delivery ledger for the same period, it is flagged as a DELIVERY DATA CHECK rather than silently accepted.

STORAGE
Data and original Excel files remain local to the current browser/device in this phase. Shared cloud sync remains a planned future major stage.

RELEASE AUDIT
The package is automatically checked for version consistency, required deployment files, service-worker cache version, external logo asset, reconciliation functions, OCR collapse, stale version badge removal, and packaged ZIP contents.
