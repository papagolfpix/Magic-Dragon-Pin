MAGIC DRAGON PIN v0.10.1 — STARTUP REGRESSION REPAIR

This replaces faulty v0.10.0.

ROOT CAUSE
The v0.10.0 barcode integration accidentally removed two existing functions while replacing the delivery docket markup block:
- inferLegacyDeliveredDockets()
- renderDocketArchive()

That caused the immediate startup ReferenceError and would also have broken saved delivery docket archive rendering.

REPAIR
- Restored both functions exactly from verified v0.9.99.
- Kept the new v0.10.0 reusable Code 128 barcode engine.
- Kept barcode display in the saved Delivery Docket.
- Kept barcode rendering in the A4 Delivery Docket PDF.
- No data migration or database changes are performed by this repair.

VERIFICATION
- JavaScript syntax: PASS
- inferLegacyDeliveredDockets: present
- renderDocketArchive: present
- Code 128 HTML/SVG renderer: present
- Code 128 PDF renderer: present
- v0.9.99 core function inventory restored
- Product barcode storage / duplicate protection retained
- v0.9.98 Delivery editor retained

FIRST TEST
1. Refresh/load v0.10.1.
2. Confirm there is no startup error.
3. Confirm Dashboard loads fully.
4. Open Delivery Dockets and confirm saved dockets render.
5. Then test one barcode in a docket/PDF.
