MAGIC DRAGON PIN v0.10.10 PRODUCTION — UNIFORM DELIVERY HOTFIX

BASE
Built directly from production v0.10.9.
Retains v0.10.7 footer/keyboard fix, v0.10.8 variant-label work and v0.10.9 finder-only toggle.

PIN-PRIORITY ISSUES FIXED

1. NEW DELIVERY COLLAPSED AFTER ADDING A LINE
Root cause:
The New Delivery Qty keyboard helper could scroll the whole active #docket section.
After Safari keyboard movement, that section scroll offset could remain, leaving the fixed top controls and bottom actions visually out of view.

Fix:
- The top New Delivery Qty no longer invokes the generic whole-section keyboard scroll helper.
- Added-line Qty uses the same product-list-only keyboard positioning as Edit/Suggested Delivery.
- The whole #docket section is never scrolled to position a Delivery Qty field.

2. NEW VS EDIT/SUGGESTED LOOKED DIFFERENT
Fix:
New, Edit and Suggested Delivery now use ONE reusable line-item component:
- Product
- Qty
- Cost / Retail / Cost total
- Remove
Same card geometry, font sizes, input sizes and scrolling in all three modes.
The old New-Delivery table editor is retired from the live editor.

3. 1g / 5g / PRE-ROLL LABELS STILL MISSING
Root cause:
Older saved production data can contain stale product-family metadata. The prior display fix trusted saved variantKey before the known price/name identity.

Fix:
Delivery identity now prefers:
- explicit name suffix (1g / 5g / Pre-Roll), then
- known price signature, then
- stored variant metadata.
This explicit label is used in:
- Product picker
- edit/new line cards
- saved docket viewer
- printed/PDF docket
- change-history labels

4. CLEAR WORDING
Edit docket no longer changes Clear back to "Clear Lines". It stays "Clear".

SMOKE TEST
A. New Delivery
- Open New Delivery.
- Add one product.
- Confirm top entry controls remain visible.
- Confirm added item appears as the same editable card style used in Suggested/Edit Delivery.
- Qty keyboard must not shift the whole page.
- Dismiss keyboard; Clear and Save remain reachable.

B. Suggested/Edit Delivery
- Open a suggested docket.
- Confirm line cards look the same as New Delivery.
- Hide product finder; only text search + A-Z + help disappear.
- Product / Qty / Add Line remain visible.

C. VARIANT LABELS
- Picker must show examples such as "Miami 1g", "Lemon Cherry Gelato 1g", "Lemon Cherry Gelato Pre-Roll".
- Printed/PDF docket must show the same explicit variant labels.

NO BUSINESS LOGIC CHANGES
No Sunday, invoice, payment, price, profit-share, stock or reconciliation calculations changed.
