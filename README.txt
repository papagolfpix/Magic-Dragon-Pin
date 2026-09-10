MAGIC DRAGON PIN v0.9.54 — UNIFIED DOCUMENT VIEWERS

This release standardises how saved documents open across Records and their own pages.

FOCUSED CHANGES
- Records no longer expands a full delivery docket inside the list.
- Tapping a Delivery docket in Records opens the normal Delivery Docket page and selects that docket in the same stable viewer used there.
- Sunday reports now use the same selector + one fixed detail-zone pattern rather than expanding accordions down the page.
- Tapping a Sunday report in Records opens the Sunday Import archive with that report already selected.
- Invoice and Payment rows continue to open the standalone invoice viewer directly.
- Manual stock/weekly records remain available as fallback evidence but do not expose the old large manual-entry interface from Records.
- No change to the 5-second Menu behaviour, delivery accounting rules, or Sunday reconciliation calculations.

TEST ON IPHONE
1. Open Records > Delivery dockets and tap several dates. Each should open the normal docket page with the selected docket in the stationary viewer.
2. Open Records > Sunday reports and tap several dates. Each should open the Sunday archive with one selected report below the compact selector list.
3. Open Records > Invoices / Payments and confirm they still open directly in the invoice viewer.
4. Confirm no document expands inside the Records list and pushes later records down the screen.

DEPLOY
Replace all 7 files in the GitHub Pages repository root, commit, wait for Pages deployment, then reopen/reload and confirm v0.9.54 in the black header.


v0.9.54 focused patch: header-only viewport isolation for iOS Safari. No workflow, record, docket, invoice, or financial logic changes.
