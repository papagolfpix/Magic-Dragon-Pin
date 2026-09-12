MAGIC DRAGON PIN v0.10.2 — BARCODE DASHBOARD ROUTING FIX

Problem
- Dashboard > Barcode needed correctly switched to Settings.
- It failed to expand Product catalogue because openMissingBarcodes() targeted #catalogueDetails,
  but the Product catalogue <details> element had no matching ID.

Fix
- Added id="catalogueDetails" to the Product catalogue accordion.
- Existing missing-barcode filter logic is unchanged.
- Existing barcode/PDF functionality is unchanged.

Expected behaviour
Dashboard > Barcode needed:
1. Opens Settings.
2. Expands Product catalogue automatically.
3. Applies missing-barcode-only filter.
4. Scrolls directly to the catalogue status/list.
