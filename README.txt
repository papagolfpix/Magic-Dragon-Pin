MAGIC DRAGON PIN v0.4.2 — SUNDAY IMPORT REFINEMENT

Changes for the next iPhone test:
- Unknown historical opening stock is no longer treated as zero.
- Reconciliation stays GREY until a genuine previous-week closing balance exists.
- Only real independent history can produce a green Verified result.
- First saved Sunday import can become the baseline for the following week.
- OCR image preprocessing added: upscale, grayscale and contrast/threshold enhancement before recognition.
- OCR product matching relaxed slightly to better handle distorted product names.
- Sunday review table becomes stacked mobile cards on iPhone so fields are not pushed off-screen.
- Summary now separates Verified / OCR checks / Errors / No history.
- v0.4.2 visible at top.
- Existing Refresh App behavior retained.

TEST AIM
1. Confirm v0.4.2 is live.
2. Re-run the SAME Sunday screenshot.
3. Compare OCR confidence/text with v0.4.1.
4. Confirm reconciliation shows grey 'No history yet' instead of false green where no prior baseline exists.
5. Check that all review fields are readable without horizontal scrolling on iPhone.
