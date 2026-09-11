MAGIC DRAGON PIN v0.9.74 — INVOICE RECORD LAYOUT + SINGLE-FILE BACKUP

Changes in this build
- Reworked saved Invoice Records layout for phone and iPad.
- Invoice branch figures now use compact four-column financial rows.
- Reduced oversized padding, font sizes and control heights in the invoice viewer.
- On iPad/tablet, Customer Copy and Payment panels now sit side-by-side.
- PDF action is compact on wider screens while remaining touch-friendly on phone.
- Full Backup now shares only the JSON backup file. The iOS share title was removed because iOS can expose that title as a second text.txt item.
- Backup payment count now recognises both the structured payment record and the invoice paid status for compatibility with older saved data.

Deployment
Replace all 7 files in the GitHub Pages repository root, commit, wait for deployment, then confirm v0.9.74 in the header.

Quick checks
1. Open Records > Invoices > a saved invoice on iPad: the record should be substantially denser and use the tablet width intelligently.
2. On iPhone, branch figures should appear as four compact columns instead of a tall 2 x 2 block.
3. Settings > Create full backup: the iOS Save sheet should show one JSON item only, not JSON + text.txt.
4. Restore preview should count an already-paid invoice under Payments.
