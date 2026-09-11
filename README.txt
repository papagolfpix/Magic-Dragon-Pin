MAGIC DRAGON PIN v0.9.73 — DASHBOARD INFORMATION AUDIT + INVOICE VIEW CLEANUP

CHANGES
- Removed Saved Deliveries, Delivery Cost Value and Recorded Weekly Sales from the dashboard. They were historical/database aggregates rather than useful current operational indicators.
- Confirmed the old Recorded Weekly Sales figure was the sum of stored historical week totals, not the current Sunday cycle; it is no longer shown as a dashboard KPI.
- Kept operational dashboard information: unpaid invoices/current due, Sunday status, Pay Pin recent weeks, and recent activity.
- Current Due to Pin remains based only on latest non-void, non-superseded unpaid invoices.
- Tightened the saved invoice viewer layout, especially on iPad/wider screens, while preserving all accounting/payment controls.
- Backup summary now counts paid invoice payment records correctly (the prior summary could show Payments: 0 even when an invoice contained a saved payment).
- Restore/Create backup control typography made more consistent.

DEPLOY
Replace all 7 files in the GitHub Pages repository root, commit, wait for deployment, then confirm v0.9.73 in the header.

TEST
1. Dashboard should no longer show Saved Deliveries, Delivery Cost Value or Recorded Weekly Sales.
2. Pay Pin strip should show 06 Sep 2026 = THB 11,194 and CURRENT DUE = THB 0 for the current restored data.
3. Open Records > Invoices and check that the invoice record is compact and readable on iPhone/iPad.
4. Create a backup and verify the restore preview reports Payments: 1 for the currently paid invoice.
