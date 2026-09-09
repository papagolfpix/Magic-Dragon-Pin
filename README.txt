MAGIC DRAGON PIN v0.9.7 — DELIVERY ENTRY QUICK FIX

WHAT CHANGED
- New Delivery product selector is now alphabetical (case-insensitive, natural numeric order).
- Quantity field starts blank instead of containing 1.
- After Add line, Quantity is cleared again ready for the next product.
- Existing v0.9.6 data/storage remains compatible.
- Service worker/cache version bumped to v0.9.7.

TEST
1. Refresh App and confirm v0.9.7.
2. Open New Delivery and open Product: names should run A-Z.
3. Quantity should be blank on entry.
4. Enter a quantity and tap Add line.
5. The line should be added and Quantity should immediately return to blank.
6. Add another product and confirm no old quantity needs deleting.
