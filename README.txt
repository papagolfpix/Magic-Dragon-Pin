MAGIC DRAGON PIN v0.9.83 — DASHBOARD NEW DELIVERY ROUTE FIX

Primary target: Pin on iPhone.

Bug fixed
- Dashboard > New Delivery could open a mostly blank Create Delivery screen.
- Root cause: the app selected its delivery layout mode before the Create pane was made visible.
- The Create/Archive pane is now selected first, then the Delivery Dockets section is activated.
- Create Delivery now explicitly applies deliveryMode and refreshes the Product list + current delivery table.
- Delivery Archive explicitly removes deliveryMode.
- Dashboard and Menu routes now use the same delivery layout state.

Retained
- A–Z product scrubber from v0.9.82.
- Dragon Home hotspot.
- Pin-first Dashboard.
- Existing delivery, pricing, invoice, reconciliation and backup logic unchanged.

Test
1. Dashboard > New Delivery.
2. Confirm complete Create Delivery form appears immediately.
3. Confirm A–Z scrubber works.
4. Tap dragon to return Dashboard.
5. Menu > Delivery Dockets > + New Delivery.
6. Confirm the screen looks and behaves the same through both routes.
