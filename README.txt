MAGIC DRAGON PIN v0.9.79 — PAYMENT NOTE IOS ZOOM FIX

Primary target: iPhone.

Change
- Fixed the one remaining Safari focus-zoom issue on the Payment reference/note field.
- Added a hard 16px override specifically to #viewerPaymentNote.
- This overrides an older invoice-payment CSS rule that still used a 12px !important font size.
- No layout, invoice, payment logic, or backup behaviour changed.

Quick test
1. Open Records > Invoices > saved invoice.
2. Expand Payment.
3. Tap Reference or note.
4. Keyboard should open without Safari zooming the page.
