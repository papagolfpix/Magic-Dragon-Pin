MAGIC DRAGON PIN v0.9.87 — SUGGESTED DOCKET DASHBOARD ROUTING CLEANUP

Primary target: Pin on iPhone.

Fix
- Dashboard suggested-delivery cards no longer open directly into Edit Docket.
- They now open the exact same Delivery Dockets saved-record view used by:
    Menu > Delivery Dockets
- The selected suggested docket opens already expanded.
- From there Pin uses the existing proven Edit Docket button if she wants to make changes.
- No suggested-docket data model, quantities, pricing, totals, reconciliation, delivery logic, or PDF logic changed.

Why
- The Menu route already displayed suggested dockets correctly with:
    full product descriptions
    Qty
    Unit cost
    Retail
    Amount
    normal action buttons
- The Dashboard shortcut was the only route bypassing that correct view and jumping directly into an older edit presentation.

Test
1. Dashboard > suggested Bangrak docket.
2. Confirm Delivery Dockets screen opens with Bangrak suggestion expanded.
3. Confirm Qty / Unit cost / Retail / Amount are visible.
4. Tap Edit Docket and confirm normal editing works.
5. Return to Dashboard using dragon.
6. Repeat for Lamai.
7. Confirm Menu > Delivery Dockets still behaves exactly the same.
