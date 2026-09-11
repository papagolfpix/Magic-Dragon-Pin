MAGIC DRAGON PIN v0.9.88 — COMBINED PACKING VIEW + ADD PRODUCT

Built from verified v0.9.87.

1. COMBINED SUGGESTED DELIVERY
- A third Dashboard row appears below the active suggested branch dockets.
- It is a temporary derived packing view, NOT a third delivery docket.
- Tapping it opens a full-screen A–Z list.
- The list shows product name and total quantity only.
- No prices, costs or financial totals.
- It reads live from the currently active suggested delivery dockets.
- If Pin edits either suggested docket, reopening the combined view uses the new saved quantities.
- If one suggestion has already been marked Delivered, only the remaining active suggestion contributes to the packing view.
- When both suggestions are Delivered, the combined Dashboard row disappears automatically.
- Nothing additional is permanently stored for the combined view.

2. ADD PRODUCT
Available from:
- Dashboard > + Add Product
- Settings > Product catalogue > + Add new product

Fields:
- Product name
- Pricing convention:
  Standard flower / 1g: cost 60, retail 150
  Pre-Roll: cost 75, retail 150
  5g pack: cost 300, retail 600
  Edible: cost 100, retail 200
  Custom pricing
- Custom mode allows Pin to choose type and enter cost/retail price per each.

On save:
- Duplicate master names are blocked.
- Product is added directly to db.products / Pin's master catalogue.
- Product alias is registered.
- It becomes available to the existing product selection workflow.
- It is included automatically in normal JSON backup/restore because it is part of the main database.

No invoice, profit-split, reconciliation, delivery-total, PDF or payment logic was changed.

TEST
A. Combined packing
1. Dashboard should show Bangrak suggestion, Lamai suggestion, then Combined Suggested Delivery.
2. Open Combined.
3. Confirm products are A–Z and only product + quantity appear.
4. Edit one branch suggested docket, save it, reopen Combined and confirm quantity changes.
5. Mark both suggested dockets Delivered and confirm Combined disappears.

B. Add product
1. Dashboard > + Add Product.
2. Add a test item using a standard price preset.
3. Confirm it appears under Settings > Product catalogue and in delivery product choices.
4. Add a custom item with custom cost/retail.
5. Confirm duplicate product name is rejected.
