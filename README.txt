WHAT CHANGED IN v0.10.125 DEPLOY

- Promoted from the iPhone-smoke-tested v0.10.125 TEST source on 19 September 2026.
- Validated on phone: visible version, clean Dashboard, real 06/13 Sep PAID invoices with synthetic record absent, normal docket list and expanded Delivered docket with readable Retail/Amount and fixed actions.
- Production presentation removes the TEST suggested-docket and backup-prompt test buttons; the hidden DEV cloud panel remains unavailable in the ordinary interface.
- No business calculations, source records, or normal Backup & Recovery actions changed in this promotion.
- Production deployment is a separate package; retain v0.10.124 TEST as validated rollback.

WHAT CHANGED IN v0.10.125 TEST

- Release-candidate cleanup based on the validated v0.10.124 checkpoint.
- Removed the dashboard-only “TEST ONLY · Create unpaid conflict test” control and its retired synthetic seed code.
- On load, removes ONLY artifacts created by that helper (tagged test invoice/docket/correction/audit records such as MD-20260913-TEST); normal business records are not touched.
- Preserves the validated v0.10.124 regression baseline: zero-difference correction closure, invoice/payment status, Sunday entry, docket status/actions, iPhone Qty keyboard behavior, compact Records lists, fixed docket action bar, and fully readable Retail/Amount headers.
- This remains a TEST build. Production promotion still requires the final phone smoke test and creation of a separate -DEPLOY package.

WHAT CHANGED IN v0.10.124 TEST

- Fixed the expanded Delivery Docket table header on iPhone so Retail and Amount are fully readable instead of clipped.
- Kept the existing compact docket layout, barcode column, fixed viewport action bar, delivery status logic, and v0.10.123 zero-difference correction lifecycle fix unchanged.
- Mobile-only CSS adjustment: smaller docket header text and tighter horizontal cell padding.

WHAT CHANGED IN v0.10.123 TEST
- Fixes a real correction-lifecycle bug found during v0.10.122 regression testing.
- If a linked delivered docket was edited, the week now reconciles, and the verified invoice difference is exactly ฿0, acknowledging the review now closes the correction automatically.
- Existing acknowledged zero-difference legacy corrections self-heal on load/recheck; no second acknowledgement is required.
- A zero-difference correction does not create a replacement invoice revision and does not create a next-Sunday adjustment.
- The resolved live signature is recorded so the invoice no longer remains falsely marked UPDATE REQUIRED.
- Paid invoices remain protected and all existing money values are left unchanged.

WHAT CHANGED IN v0.10.122 TEST
- A completed correction clears its old Resume conflict resolution shortcut when returning to the dashboard.
- The shortcut also disappears on the dashboard while a correction remains in progress; the dashboard keeps its own action.
- This interface change does not edit saved invoices, dockets, quantities, or amounts.

WHAT CHANGED IN v0.10.121 TEST
- A saved choice to carry a correction forward no longer hides an unreconciled invoice week.
- The dashboard says the correction is waiting for reconciliation, and offers a direct Review correction button.
- No existing invoice, correction, docket or amount is changed by this update.

WHAT CHANGED IN v0.10.120 TEST
- A Sunday top-up derived from a report never counts as a delivery into that same report, even if its saved date is earlier.
- Existing dockets and completed invoices are not edited; any misdated delivered top-up remains visibly flagged for review.
- Future marking of generated top-ups requires an actual delivery date after their source Sunday report.
- TEST-copy exclusions and original docket snapshot handling from v0.10.119 remain.
