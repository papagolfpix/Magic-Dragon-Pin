MAGIC DRAGON PIN v0.9.84 — CLEAN DELIVERY ROUTING REPAIR

Primary target: Pin on iPhone.
Sunday-handover critical repair.

Root cause repaired
- Delivery Dockets had two historical layout states:
    deliveryMode = Create Delivery
    docketMode   = saved-docket Archive
- v0.9.83 accidentally applied BOTH states to Create Delivery.
- Archive fixed-height/overflow CSS then clipped the Create form after the search field.
- This produced the large blank page seen from Dashboard > New Delivery.

Clean architectural repair
- Added one setDeliveryView() controller.
- Create and Archive states are now mutually exclusive.
- openDeliveryCreate() always establishes Create state before navigation.
- openDeliveryArchive() always establishes Archive state before navigation.
- switchTab() no longer independently changes delivery modes.
- Records and saved-docket links now enter through openDeliveryArchive().
- Added a clean late CSS layer so Create Delivery uses a normal iPhone scroll pane
  and cannot inherit the archive's fixed-height clipping rules.

A–Z scrubber improvement
- Typed Find Product search is UNCHANGED: more typed letters still narrow the list.
- A–Z scrubber no longer filters the dropdown to a single letter.
- Scrubbing to a letter selects the first product at/after that alphabetical position.
- The FULL alphabetic product list remains available when the selector is opened.
- This means landing on R instead of T still leaves Pin only a short scroll away.

Test sequence
1. Dashboard > New Delivery.
   - Complete Create Delivery form must be visible.
2. Dragon > Dashboard.
3. Menu > Delivery Dockets > + New Delivery.
   - Must produce the identical Create Delivery screen.
4. Drag A–Z scrubber to R/S/T.
   - Product selection should jump alphabetically.
   - Open Product dropdown: full catalogue should still be available.
5. Type several letters into Find Product.
   - Existing narrowing search must still work unchanged.
6. Add a line and save a test docket.
7. Open the saved docket from Records and from Delivery Dockets archive.
