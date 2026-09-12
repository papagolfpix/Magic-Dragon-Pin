MAGIC DRAGON PIN v0.9.96 — DELIVERY EDIT SCROLL CORRECTION

This replaces the faulty v0.9.95 edit-scroll approach.

ROOT CAUSE
Magic Dragon uses a fixed contentViewport shell on iPhone.
v0.9.95 incorrectly tried to make the body/page itself scroll in Edit mode.
The fixed shell continued clipping the page, so the edit cards extended downward
without a usable scrolling owner.

CORRECTED ARCHITECTURE
There is now ONE scroll owner in Delivery Edit mode:
  #docket inside the existing fixed contentViewport.

No nested edit-list scrolling.
No body-scroll workaround.
No change to the normal saved-docket viewer.

EDIT MODE
- #docket fills the available viewport beneath the fixed header.
- #docket scrolls vertically through the entire edit form.
- Product cards, bottom controls and Save/Cancel controls all participate in the same scroll.
- Extra bottom safe-area padding keeps the final controls above iPhone Safari chrome.
- Product cards have been tightened substantially to reduce unnecessary vertical space.

PRESERVED
- saved-docket viewer
- delivery IDs and quantities
- product/pricing logic
- Sunday reconciliation
- suggested delivery references
- Combined Suggested Delivery
- invoices/payments
- archive/restore
- support/baseline backups
- PDFs and audit history

CRITICAL TEST
1. Open suggested docket.
2. Tap Edit Docket.
3. Swipe upward through the product list.
4. Confirm every product can be reached.
5. Continue until Save Docket Changes / Cancel are visible.
6. Change one Qty.
7. Confirm the screen remains at the same scroll position.
8. Save and confirm viewer opens with the updated quantity.
