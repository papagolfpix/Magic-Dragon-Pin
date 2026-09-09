MAGIC DRAGON PIN v0.9.10 — DELIVERY MOBILE / CANONICAL LIST FIX

Changes:
- New Delivery product selector uses canonical master products only.
- Product selector is deduplicated by master identity/name and remains alphabetical.
- Obsolete product records whose names are mapped as aliases to another master product are hidden from delivery selection.
- iPhone delivery lines render as contained cards; the page no longer widens/pans sideways because of the delivery table.
- Quantity remains blank before entry and clears after Add Line.
- Price validation/repair from v0.9.8 retained.
- Delivery docket issuer remains Yaowaret.
- Service worker/cache bumped to v0.9.10.

Test:
1. Refresh App and confirm v0.9.10.
2. New Delivery: open Product and verify A-Z order and no mapped duplicate aliases.
3. Add Super Lemon Haze 1g x15; expect cost 60, retail 150, line cost 900.
4. Add another line and confirm Qty clears after each Add Line.
5. Confirm the New Delivery screen cannot pan horizontally on iPhone.
