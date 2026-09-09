MAGIC DRAGON PIN v0.9.5 — MASTER NAME SAVE / VISUAL CONFIRMATION FIX

Deploy all files in this folder to the GitHub repository root.

WHAT CHANGED IN v0.9.5
- Fixes Master Product Setup so saved corrections immediately become the main displayed product names.
- The shop's original wording is retained only as an alias/reference under Pin's saved master name.
- Multiple shop spellings mapped to the same master product are grouped under Pin's canonical product identity after save.
- Rows whose names were actually changed in the latest save are highlighted green and show “Saved just now”.
- Save confirmation reports how many corrected product names were applied.
- Renaming a saved master product now reuses the existing product identity rather than accidentally creating a duplicate product.
- Delivery, weekly-history and stock references are reassigned when products are merged.
- Existing localStorage data and prior imports are preserved.
- Service worker/cache version bumped to v0.9.5.

QUICK TEST
1. Deploy all 7 files and open the live GitHub Pages app.
2. Tap Refresh App and confirm the header says v0.9.5.
3. Open Settings > Master Product Setup.
4. Change one or more Pin product names and press Save Pin's Master Product List.
5. Confirm the corrected names now appear as the bold/main names.
6. Confirm the old shop spellings appear underneath as “Received as” aliases where they differ.
7. Confirm only the products changed in that save are highlighted green with “Saved just now”.
8. Go to New Delivery and confirm its product selector uses the corrected master names.
9. Close/reopen Safari and confirm the corrected names remain saved.

FILES
- index.html
- sw.js
- manifest.webmanifest
- Magic-Dragon-logo.jpeg
- icon-192.png
- icon-512.png
- README.txt


v0.9.5 fix: Master Product Setup now treats Pin's exact typed spelling, capitalization, spacing and punctuation as authoritative. Exact-format corrections save even when the normalized matching key is unchanged, and edited rows are highlighted green after Save.


v0.9.5 test chunk:
- 3x3 sticky navigation grid; hero scrolls away.
- Master product save count reports edited rows, not alias updates.
- Consecutive/leading/trailing whitespace in Pin product names is cleaned automatically.
- Catalogue Integrity cards compare each branch latest Sunday sheet with products historically seen there and flag missing/unmapped names for review.
