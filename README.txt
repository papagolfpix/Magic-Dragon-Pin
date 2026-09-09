MAGIC DRAGON PIN v0.9.8 — DELIVERY PRICE / RUNTIME FIX

Changes:
- Fixed the Safari runtime error: escapeHtml is now defined.
- Delivery selector remains alphabetical A–Z.
- Quantity field starts blank and clears after each added line.
- Delivery pricing resolves from the canonical master product record.
- Known renamed 1g products with zero prices are repaired from the original catalogue where the match is exact/high-confidence (for example Super Lemon Haze 1g -> cost 60, retail 150).
- Unknown products are never assigned guessed prices; the app blocks the line/docket and asks for prices in Settings.
- Docket issuer changed to Yaowaret.
- Service worker/cache bumped to v0.9.8.

Quick test:
1. Refresh App and confirm v0.9.8.
2. New Delivery: verify A-Z product list and blank Qty.
3. Add Super Lemon Haze 1g x 15: expect cost ฿60, retail ฿150, cost total ฿900.
4. Add Permanent Maker 5g x 1: expect cost ฿300, retail ฿600, cost total ฿300.
5. Total cost should be ฿1,200 for those two lines.
6. There should be no red escapeHtml error.
7. Save docket and verify issuer reads Yaowaret and prices are preserved.
