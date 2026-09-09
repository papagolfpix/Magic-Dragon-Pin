MAGIC DRAGON PIN v0.4.4 — MULTI-PASS OCR TEST BUILD

CHANGES
- Five OCR passes per screenshot:
  1. Original colour
  2. Grayscale contrast
  3. Light threshold
  4. Dark threshold
  5. Green-channel contrast
- OCR results are compared instead of trusting a single pass.
- Agreement across passes boosts confidence.
- Conflicting reads remain highlighted for review.
- OCR images are enlarged more aggressively for small spreadsheet text.
- Sunday Import mobile layout rebuilt as full-width two-column cards.
- Product/OCR text spans full width; numeric/status fields use available screen width.
- Grey "No history yet" reconciliation behavior retained.
- Visible version v0.4.4.
- Refresh App retained.

EXPECTED TEST
Use the same Sunday screenshot as before so OCR confidence and layout can be compared directly with v0.4.3.

NOTE
This build deliberately takes longer to process screenshots in exchange for better OCR quality.
