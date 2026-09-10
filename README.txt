MAGIC DRAGON PIN v0.9.34 — INVOICE RECORDS & REVISION FOUNDATION

This release makes saved invoices behave like standalone documents rather than reopening the Sunday Workflow.

Key changes:
- Records > Invoices now opens a human-readable saved invoice viewer.
- Saved invoice viewer can create/share the same polished PDF directly.
- Invoice versions are preserved instead of overwriting an earlier saved invoice when underlying figures change.
- Earlier invoice versions show a clear warning and link to the newer version.
- Current saved invoices can be marked SENT / NOT SENT with sent date and note.
- Dashboard Attention area appears only when a saved invoice has become outdated or an unresolved financial adjustment exists.
- If a previously sent/paid invoice is revised and the amount changes, a pending adjustment record is created for later resolution/carry-forward handling.
- Existing invoice, reconciliation, payment and PDF logic remains intact.

Deploy all 7 files to the GitHub Pages repository root, commit, wait for Pages, open the app, tap Refresh App, and confirm v0.9.34.
