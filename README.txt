MAGIC DRAGON PIN v0.9.87 — CORRECTED DEPLOY BUILD

This replaces the earlier faulty v0.9.87 package.

Verified change
- Dashboard suggested-delivery cards now call openDeliveryArchive(id).
- They open the exact same normal saved-docket view as Menu > Delivery Dockets.
- The selected suggested docket opens expanded.
- Edit Docket remains the normal, existing editor.

No other delivery, pricing, invoice, reconciliation, backup or PDF logic changed.

Verification performed on packaged index.html:
- Visible app version = v0.9.87
- Backup appVersion = 0.9.87
- Dashboard route contains openDeliveryArchive(id)
- Dashboard route does NOT contain editDocket(id)

Test
1. Dashboard > suggested Bangrak docket.
2. Confirm normal Delivery Dockets view opens with Bangrak expanded.
3. Repeat for Lamai.
4. Confirm Menu > Delivery Dockets remains unchanged.
