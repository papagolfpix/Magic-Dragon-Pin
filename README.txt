MAGIC DRAGON PIN v0.9.70 — DASHBOARD OPERATIONAL CLEANUP

Focused release:
- Dashboard is now a compact operational summary rather than a setup page.
- Quick actions are Delivery Dockets, Sunday Wizard and Records.
- Unpaid invoices shows outstanding count and total amount due.
- Sunday status clearly shows Ready for next Sunday or the active cycle date.
- Recent activity shows latest delivery, completed Sunday cycle and payment when available.
- Business setup/profit split information is removed from the everyday dashboard.
- Existing correction and accounting alerts remain conditional and only appear when relevant.
- Preserves v0.9.69 docket viewer and Records fixes.

DEPLOYMENT
Replace all 7 files in the GitHub Pages repository root, commit, wait for deployment, then confirm v0.9.70 in the header.

TEST
1. Open Dashboard and confirm the three quick actions are compact and work.
2. Confirm Unpaid invoices and Sunday status make sense against the saved data.
3. Confirm Recent activity is compact and does not overlap the fixed header.
4. Open Delivery Dockets and Records to confirm v0.9.69 behaviour remains intact.
