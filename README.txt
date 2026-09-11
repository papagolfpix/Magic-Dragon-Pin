MAGIC DRAGON PIN v0.9.91 — MOBILE CATALOGUE LAYOUT FIX

Problem fixed
- On iPhone the Product Catalogue table was wider than the screen.
- Type / Cost / Retail columns pushed Archive / Restore controls off-screen.

New layout
- Each product family remains grouped under its parent heading.
- Each variant now displays as a compact mobile row:
    Variant badge + product name
    Type / Cost / Retail underneath
    Archive / Restore button permanently visible on the right
- Archive all / Restore all remains on the parent row.
- No horizontal scrolling should be required.

No catalogue logic changed.
Archive still:
- removes product from new delivery selections
- preserves product ID
- preserves historical dockets, Sunday reports, invoices, mappings and audit data
- can be reversed with Restore

TEST
1. Settings > Product Catalogue on iPhone.
2. Confirm each row fits the screen.
3. Confirm Archive button is visible.
4. Archive one obsolete variant.
5. Confirm it disappears from active catalogue and new Delivery product selection.
6. Show archived and Restore it.
