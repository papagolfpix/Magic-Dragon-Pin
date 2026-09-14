MAGIC DRAGON PIN v0.10.9 PRODUCTION — PRODUCT FINDER HOTFIX

BASE
Built directly from production v0.10.8.
Retains:
- v0.10.7 iPhone New Delivery footer/keyboard hotfix
- v0.10.8 explicit 1g / 5g / Pre-Roll variant labels throughout Delivery and printed docket output

BUG
In Edit / Suggested Delivery, the toggle intended to hide the optional product-finder controls
was hiding the entire deliveryEntryTools container. That also removed Product, Qty and Add Line.

FIX
The Delivery controls are now split into:
1. OPTIONAL FINDER:
   - text search
   - A-Z scrubber
   - small delivery-entry help
2. CORE ADD CONTROLS — ALWAYS VISIBLE:
   - Product
   - Qty
   - Add Line

The toggle now says:
- + Show product finder
- - Hide product finder

It only opens/closes the optional finder.
It can never hide Product / Qty / Add Line.

PIN-PRIORITY TEST
1. Open a Suggested Delivery or existing unsent docket.
2. Confirm Product, Qty and Add Line are visible.
3. Tap Hide product finder.
4. Confirm only Find Product + A-Z + help disappear.
5. Confirm Product, Qty and Add Line stay visible and usable.
6. Tap Show product finder and confirm the finder returns.
7. Save the docket.

NO BUSINESS-LOGIC CHANGES
No Sunday, invoice, payment, catalogue-price, profit-share or stock calculation changes.
