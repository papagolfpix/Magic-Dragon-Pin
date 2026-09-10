MAGIC DRAGON PIN v0.9.43 — COMPACT DOCKET EDITOR + CORRECTION RULES

WHAT CHANGED
- Delivery docket editing is substantially more compact on phones. Existing lines now use a dense single-row layout instead of large stacked cards.
- Product and quantity remain directly editable on saved dockets. Cost/retail values still follow the master catalogue automatically.
- The correction choices are now full-width stacked rows so labels cannot overflow or clip on iPhone.
- If a delivered docket affects an UNPAID invoice, Save remains disabled until one of two choices is made: Update this invoice, or Add to next Sunday’s invoice.
- If the affected invoice is PAID, there is no choice and no paid-invoice edit. A short notice explains that the financial correction will be carried automatically to the next Sunday billing cycle.
- If an edit temporarily breaks reconciliation, the app does not calculate a false partial invoice difference. It waits until the week reconciles before applying the locked correction treatment.
- Next-Sunday corrections remain automatic and appear separately on the next invoice with a short explanation and positive/negative amount.
- Post-delivery line changes retain human-readable history in the app; pre-delivery draft corrections do not.
- Routine delivery-entry help is collapsed so the working screen is cleaner while help remains available when needed.

DEPLOYMENT
Deploy all 7 files in this ZIP to the GitHub Pages repository root, commit, wait for Pages, open the app, tap Refresh App, and confirm v0.9.43.

Files:
Magic-Dragon-logo.jpeg
README.txt
icon-192.png
icon-512.png
index.html
manifest.webmanifest
sw.js
