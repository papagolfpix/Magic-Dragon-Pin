MAGIC DRAGON PIN v0.9.2 — REAL-WORKBOOK MULTI-WEEK FIX

ROBUST MULTI-WEEK IMPORT
- Multi-week detection rebuilt against the actual uploaded file:
  Lamai 20260823.xlsx
- Uses the report title marker "Old Stock from" + "Check Date" rather than assuming all table headings are on one row.
- Real regression-test expectation:
  23/08/2026 — 28 products
  30/08/2026 — 28 products
  06/09/2026 — 28 products
- BM single-week regression file also tested:
  one report — 42 product rows.
- Pre-import screen now states "3 weekly reports detected" and dynamically updates:
  Import 3 Selected Reports / Import 2 Selected Reports etc.
- Each selected block remains an independent branch/date report with normal duplicate protection.

PRODUCT MAPPING
- Added "Unsure — Check Later".
- Deferred mappings are not merged and do not create a separate product.
- Settings shows a Check Later queue with Review Now.
- Merge and Keep Separate behavior retained.

OTHER
- Simple numeric formula fallback added for formula-like numeric strings.
- Minor mobile overflow protection added to Historical Data and Settings.
- Existing Sunday report delete, compact reconciliation, duplicate protection and OCR emergency backup retained.


v0.9.2: Adds one-time Master Product Setup. Every unique shop spreadsheet name can be assigned to Pin's exact master name; aliases are saved, duplicates can be consolidated, historical Excel rows are remapped, and delivery dropdowns use the master catalogue. Product names are also editable in Settings. Fixes misplaced delivery search markup.
