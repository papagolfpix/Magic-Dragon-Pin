MAGIC DRAGON PIN v0.9.72 — DASHBOARD PAY PIN CORRECTION + TREND STRIP

Focused release:
- Fixes the dashboard Pay Pin error: the old figure was summing historical weekly Pin profit-share values, which is not the same as money currently owed.
- Current Due now comes only from current, non-superseded UNPAID invoices. A paid invoice immediately reduces Current Due to zero.
- Adds a compact four-column Pay Pin strip: up to three most recent paid invoice cycles plus CURRENT DUE.
- Missing trusted historical paid cycles show as — rather than inventing values.
- Adds a small up/down/flat percentage indicator once at least two paid cycles exist.
- Removes the misleading "Calculated Pay Pin" metric card.
- No Sunday workflow, invoice, payment, docket or backup data is modified by this release.

DEPLOYMENT
Replace all 7 files in the GitHub Pages repository root, commit, wait for deployment, then confirm v0.9.72 in the header.

TEST
1. Dashboard should show CURRENT DUE = ฿0 because the 6 Sep ฿11,194 invoice is paid.
2. The recent paid strip should show the 6 Sep cycle as ฿11,194 and — for unavailable earlier paid cycles.
3. Records > Invoices should still show the 6 Sep invoice as PAID with the 11 Sep bank-transfer payment.
4. Create a test unpaid state only if desired later; Current Due should equal the unpaid invoice amount and return to zero when marked paid.
