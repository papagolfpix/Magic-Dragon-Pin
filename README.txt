MAGIC DRAGON PIN v0.9.89 — PRODUCT FAMILY / VARIANT MIGRATION

NON-DESTRUCTIVE MIGRATION
Existing product IDs are retained. Historical dockets, Sunday reports, invoices, mappings and audit records are not rewritten.

STANDARD CLASSIFICATION
Cost 60 / Retail 150  -> 1g variant, raw weight 1g
Cost 300 / Retail 600 -> 5g variant, raw weight 5g
Cost 75 / Retail 150  -> Pre-Roll variant, estimated raw weight 1g

Other price combinations are marked Special/Exception for later review. Gummies/edibles and identifiable hash/mousse/concentrates remain exceptions.

CATALOGUE MODEL
Each existing SKU gains:
- parentName
- variantKey
- variantLabel
- unitWeightGrams
- catalogueException

Example:
Super Lemon Haze
  1g
  5g
  Pre-Roll

ADD PRODUCT
Enter the raw/base product once, then select any combination of:
- 1g
- 5g
- Pre-Roll
- Special/custom

An existing parent can receive a new variant later.

IMPORTANT
The actual sellable SKU records remain intact so existing delivery, Sunday import, pricing and historical logic continue to work.

NEXT SMALL STEP
Archive/hide obsolete products without deletion.
