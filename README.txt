MAGIC DRAGON PIN v0.9.97 — DELIVERY EDIT WORKSPACE POLISH

Built from verified v0.9.96.

EDIT SCREEN NOW USES THREE FIXED ZONES

1. TOP ZONE — always visible
- Delivery Dockets heading
- Edit delivery docket + reference
- suggested-docket notice
- Branch / Date
- + Add another product
- Delivery note
- Vertical spacing and control heights have been reduced without shrinking the main readable input text.

2. MIDDLE ZONE — ONLY SCROLLING AREA
- Only the product list scrolls.
- The rest of the editor remains visible.
- Product cards are more compact vertically.
- Product selector remains full-width and readable.
- Cost / Retail / Cost total stay secondary.
- Qty and remove controls remain visible.

3. BOTTOM ZONE — always visible
- Total cost
- Cancel
- Clear Lines
- Save Docket Changes

QTY EDITING
- Tapping/focusing a Qty box automatically selects the existing number.
- Typing a new number replaces the old value immediately.
- No need to press backspace/delete first.

SCROLL POSITION
- Product-list position is preserved when Qty/product changes cause a rerender.

UNCHANGED
- saved docket viewer
- delivery calculations
- product/pricing logic
- Sunday reconciliation
- suggested docket logic
- Combined Suggested Delivery
- invoices/payments
- archive/restore
- baseline/support backups
- PDFs / audit history

TEST
1. Open a suggested docket > Edit Docket.
2. Confirm top controls stay visible while products scroll.
3. Confirm Total cost / Cancel / Clear Lines / Save stay visible at bottom.
4. Scroll product list from first to last item.
5. Tap a Qty containing 4 and type 7; result should become 7, not 47.
6. Change another Qty and confirm product-list scroll position does not jump.
7. Save and confirm viewer reflects changes.
