MAGIC DRAGON PIN v0.9.11 — DOCKET DELETE / AUDIT PATCH

Changes:
- Saved delivery dockets can be deleted from the expanded Delivery Docket archive.
- Deletion uses two confirmations and immediately removes the docket from live reconciliation/totals.
- A read-only deletion snapshot is retained in Audit > Delivery docket change log.
- Deleting a delivery from History uses the same audited deletion path.
- New Delivery line cards are now neutral white; catalogue/status colours no longer leak into delivery entry.
- Existing v0.9.10 canonical product cleanup, alphabetical list, price repair, blank quantity, responsive cards, Yaowaret issuer and sticky navigation remain.
- Service worker/cache bumped to v0.9.11.

TEST:
1. Refresh App and confirm v0.9.11.
2. Open Delivery Docket and expand a test docket.
3. Tap Delete Docket; cancel the first prompt and confirm nothing changes.
4. Repeat and accept both prompts. Confirm the docket disappears.
5. Confirm Dashboard saved-delivery count/total and reconciliation no longer include that docket.
6. Open Audit and confirm a Deleted docket log entry remains.
7. In New Delivery, confirm all entered product cards are white.
