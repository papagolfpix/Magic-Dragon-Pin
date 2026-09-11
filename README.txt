MAGIC DRAGON PIN v0.9.90 — ARCHIVE / RESTORE PRODUCTS

Built from verified v0.9.89.

WHAT CHANGED
- Product Catalogue now supports Archive and Restore.
- Each individual variant can be archived.
- An entire parent-product family can be archived with Archive all.
- Archived products are hidden by default.
- Show archived displays them with Restore controls.
- Active/archived counts are shown in Product Catalogue.

IMPORTANT SAFETY BEHAVIOUR
Archiving is NOT deletion.
An archived product:
- disappears from new Delivery Docket product selection
- disappears from normal active catalogue view
- retains the same product ID
- remains available to historical dockets, Sunday reports, invoices, mappings, analytics and audit history
- can be restored at any time

ADD PRODUCT
If Pin tries to recreate a standard variant that already exists but is archived, the app tells her to Restore it rather than create a duplicate.

NOT CHANGED
- Historical records
- Sunday reconciliation logic
- Invoice calculations
- Suggested-delivery logic
- Combined packing view
- Product family / variant migration
- Existing delivery docket viewer/editor

TEST
1. Settings > Product Catalogue.
2. Archive one obsolete variant.
3. Confirm it disappears from the active catalogue.
4. Start a New Delivery and confirm it is absent from the product dropdown/search list.
5. Return to Product Catalogue > Show archived.
6. Confirm the item is still present and marked ARCHIVED.
7. Restore it.
8. Confirm it returns to New Delivery selections.
9. Test Archive all on a product family only if comfortable; Restore all reverses it.
