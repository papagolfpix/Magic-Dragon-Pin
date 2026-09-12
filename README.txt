MAGIC DRAGON PIN v0.10.0 — BARCODE RENDERING + DELIVERY DOCKET

Built from verified v0.9.99.

NEW REUSABLE BARCODE ENGINE
- Internal Code 128-B renderer.
- No external website, library or API required.
- Barcode data remains stored as plain text on the variant.
- Graphics are generated only when displayed/printed.
- Same engine is designed to be reused later for sticker sheets and stock labels.

DELIVERY DOCKET VIEWER
- Added Barcode column on the right side.
- Each product variant with a stored barcode displays:
    scannable Code 128 graphic
    human-readable barcode text underneath
- Variants without a barcode show a blank dash.
- Existing product/pricing/quantity data is unchanged.

A4 DELIVERY DOCKET PDF
- Added a Barcode column on the right margin.
- Barcode graphic is generated directly into the PDF drawing commands.
- Human-readable barcode text is printed underneath.
- Product remains the widest text column.
- If a code is unusually long and would make bars too narrow to print reliably, the PDF keeps the human-readable code rather than drawing an unsafe barcode.

BARCODE FORMAT
- Current graphics use Code 128-B.
- Supports printable ASCII characters, including ordinary numeric shop codes.
- This is intentionally general because Pin may receive numeric or alphanumeric shop codes.

NOT YET INCLUDED
- Sticker-sheet printing.
- Bulk label quantities.
- Camera barcode scanning.
These can reuse this same rendering module.

PRESERVED
- barcode entry / missing-barcode Dashboard task
- Delivery editor v0.9.98 behavior
- Sunday workflow
- suggested deliveries / Combined Suggested Delivery
- invoices/payments
- product families / archive restore
- backup/restore
- audit history

TEST
1. Give one active variant a test barcode in Product Catalogue.
2. Open a Delivery Docket containing that exact variant.
3. Confirm barcode appears at right with its text beneath.
4. Confirm products without codes show no false barcode.
5. Create / Share PDF.
6. Open the PDF and confirm the same barcode appears beside that product.
7. If possible, scan the PDF barcode with another phone/barcode app and confirm it returns the stored text.
