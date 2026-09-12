MAGIC DRAGON PIN v0.9.94 — CONSERVATIVE AUDIT / CLEANUP

Built from verified v0.9.93.

AUDIT RESULT
- JavaScript syntax: PASS
- Duplicate named function declarations: NONE
- Duplicate window/global handlers: NONE
- Critical Sunday workflow features preserved

SAFE CLEANUP ONLY
Removed:
1. Obsolete PRODUCT_PRICE_PRESETS constant left behind by the old single-SKU Add Product form.
   - The current parent-product + variant workflow no longer references it.
2. Obsolete Delivery-editor CSS selectors that no longer attach to any current DOM elements.

NO BEHAVIOUR CHANGES INTENDED

PRESERVED / VERIFIED
- Product parent + variant catalogue
- Archive / Restore
- Dashboard suggested-docket first-tap routing fix
- Combined Suggested Delivery
- Baseline Snapshot
- Support Backup
- Test Sunday Backup Prompt
- Existing Sunday workflow
- Existing invoice/payment logic
- Existing delivery data / pricing / PDF logic
- Existing backup/restore data model

RECOMMENDED CHECK
This build should behave exactly like v0.9.93. A quick smoke test is enough:
- open Dashboard
- open one suggested docket
- open Combined Suggested Delivery
- open Product Catalogue
- verify Archive controls
- open Safety snapshots
