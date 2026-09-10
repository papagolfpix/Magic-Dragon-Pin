MAGIC DRAGON PIN v0.9.24 — CATALOGUE INTEGRITY REPAIR

This release is focused on product identity and pricing integrity before the guided Sunday workflow is built.

DEPLOYMENT
1. Replace the seven files in the GitHub repository root with the seven files from this ZIP.
2. Commit the changes and wait for GitHub Pages to publish.
3. Open the app and tap Refresh App.
4. Confirm the header shows v0.9.24.

KEY FIXES
- Repairs confirmed legacy spelling variants across existing saved data and future Excel imports.
- Corrects Columbiana -> Colombiana across 1g/5g/pre-roll families.
- Corrects Runtz Layer Cane/Cank -> Runtz Layer Cake.
- Corrects Super Haze Lemon -> Super Lemon Haze.
- Corrects Night Move Pre-oll -> Night Move Pre-Roll.
- Normalizes redundant 1g suffixes only when an exact standard-flower product exists.
- Adds/repairs Rose Gold Pave 1g at cost 60 / retail 150.
- Uses spreadsheet cost/retail as a strong contextual signal when an ambiguous shop name could refer to a different size/form. Example: Lamai's plain 'Tropicana Cherry' row at cost 75 resolves to Tropicana Cherry Pre-Roll, while cost 60 resolves to the flower.
- Existing confirmed aliases remain authoritative unless the spreadsheet price signature proves a different size/form of the same product family.
- Unknown/fuzzy product names still do not auto-map or inherit prices.

TESTED
- Both supplied Excel workbooks were audited.
- 72 distinct workbook product-name/price cases resolve to the correct catalogue product and price.
- Workbook arithmetic checks passed with zero row-level total/sold/sales errors.
- Existing saved typo/duplicate migration and delivery-reference reassignment were tested.
- All 54 base catalogue products have positive cost/retail prices and unique normalized identities.
- JavaScript syntax check passed.
