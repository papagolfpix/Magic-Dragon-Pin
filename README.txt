MAGIC DRAGON PIN v0.10.12 PRODUCTION — SUNDAY QUICK ADD

BASE
Built directly from production v0.10.11.

PIN WORKFLOW ENHANCEMENT
When Pin is editing an existing or Sunday Suggested Delivery docket, two compact controls now appear beside the product-entry area:

1. SHOW ALL STOCK
- Default Sunday/shop picker remains the normal compact list.
- Tap Show all stock to expose the full active master catalogue.
- This lets Pin add existing supply stock that is not currently part of the shop's normal quick list.
- Tap Use shop list to return to the normal list.

2. + NEW PRODUCT
- Opens the existing master Add Product form without leaving the docket workflow.
- The same product component used in Settings is reused; no second product system was created.
- After saving a new product, Pin returns to the same docket.
- The full catalogue is enabled automatically and the newly-created product is selected when possible.

CORE DELIVERY CONTROLS
Product / Qty / Add Line remain visible.
Finder hide/show behaviour is unchanged.

CUSTOMER-FACING BRANDING RULE
"Magic Dragon" is internal-only branding.
This release removes it from:
- Delivery docket PDF footer
- Invoice PDF footer
Internal app UI, backups, diagnostics and administration retain Magic Dragon naming.

NO RESTOCK TARGET LOGIC YET
This release does NOT implement the new Sunday par-stock quantities.
Those remain the next focused block after production stability.

NO BUSINESS CALCULATION CHANGES
No Sunday reconciliation, invoice amounts, payment, stock, cost, retail or profit-share calculations changed.

SMOKE TEST
A. Suggested Delivery
1. Open a Sunday suggested docket.
2. Confirm Show all stock and + New product are visible.
3. Tap Show all stock; verify full active catalogue appears.
4. Tap Use shop list; verify normal shop list returns.
5. Tap + New product; add a product.
6. Save it; return to the same docket and confirm the new item is selectable.
7. Add it to the docket and save.

B. Customer document
1. Create/share a delivery docket PDF.
2. Create/share an invoice PDF.
3. Confirm neither customer-facing PDF contains the words "Magic Dragon".
