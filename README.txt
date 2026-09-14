MAGIC DRAGON PIN v0.10.11 PRODUCTION — DELIVERY STABILITY HOTFIX

Built directly from production v0.10.10.

OBSERVED FAILURE
New Delivery -> add one product -> the live editor could collapse/disappear, leaving only a header/table area.

ROOT CAUSE
The Add Line handler was doing a global save/render cycle while Pin was still editing:
- currentDelivery was updated;
- save() ran;
- save() calls renderAll();
- renderAll() rebuilt unrelated screens, including the saved-docket archive;
- the handler then scrolled the whole docket section.

That is unsafe during an active editor session.

FIX
- Add Line is now a draft-only in-memory action.
- It rerenders only the Delivery editor.
- It does not write the database until Save Delivery is pressed.
- It no longer scrolls the whole docket section.
- Only the delivery line list scrolls to the newly-added item.
- renderAll() will not rebuild the saved-docket archive while Delivery mode is active.
- Delivery mode forcibly isolates the Create pane from the Archive pane.

RETAINED
- v0.10.10 unified New/Edit/Suggested Delivery cards
- explicit 1g / 5g / Pre-Roll labels
- finder-only hide/show
- iPhone keyboard/footer fixes
- Clear wording consistency

NO BUSINESS LOGIC CHANGES
No Sunday, invoice, payment, stock, price, profit-share or reconciliation logic changed.

TEST
1. Open New Delivery.
2. Add one product.
3. Editor remains visible.
4. Added line appears as an editable card.
5. Add several more lines.
6. Qty keyboard does not move the whole page.
7. Clear and Save remain reachable.
8. Save docket successfully.
