MAGIC DRAGON PIN v0.4.0

MAJOR SUNDAY IMPORT TEST BUILD
- New Sunday Import screen.
- Multiple screenshot selection from iPhone Photos.
- Browser OCR reader with per-row confidence.
- Green / amber / red / purple review states.
- Reconciliation runs at the same time as OCR review.
- High OCR confidence never overrides a reconciliation mismatch.
- Possible delivery/data-entry problems are distinguished from OCR uncertainty.
- Editable closing stock and reported-sold fields.
- Sunday check is not committed until Pin confirms it.
- Visible v0.4.0 build badge.
- Refresh App button clears Magic Dragon app caches/service worker and reloads with a cache-busting URL.
- Existing local records are preserved by Refresh App.

NOTE
OCR is loaded on demand from Tesseract.js CDN, so internet access is required while reading screenshots in this test build. The rest of the app remains local/offline-first.
