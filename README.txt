MAGIC DRAGON PIN — v0.10.137 DEPLOY
2 November 2026

TARGETED HISTORICAL MAPPING REPAIR
- Corrects confirmed Lamai source typo "Rainbow Bells" to "Rainbow Belts".
- Keeps variants separate: 1g, 5g and Pre-Roll.
- Links 25 October and 1 November imported rows to the same canonical product IDs used on 18 October.
- Preserves original Sunday source spellings, deliveries, invoice, payment, stock quantities, prices and dates.
- Does not treat an edit made for a later week's delivery as an edit to an already paid earlier invoice.
- Clarifies future dashboard alerts when no edited delivery docket belongs to a flagged invoice week.
- Rechecks mapping after cloud restoration; idempotent.

FORENSICS (using user-provided 2 November backup; user data NOT embedded in ZIP)
- Lamai 18 Oct closing: Rainbow Belts 1g 6, Pre-Roll 3.
- Lamai 25 Oct opening: incorrectly mapped Rainbow Bells 1g 6, Pre-Roll 3.
- After canonical ID repair: both historical Sunday weeks reconcile; payments unchanged.
- Lamai late-week delivery D1793429786465 was re-dated Oct 31 -> Nov 2, outside the Oct 25 invoice week.

INSTALLATION
- Save a fresh Complete App Data backup from the live iPhone BEFORE updating.
- Deploy this DEPLOY ZIP to production using your established repository process.
- This ZIP is an app-only update; it does not include or import private shop data.
- Refresh and verify v0.10.137 DEPLOY; check dashboard alert clears.
- Do not reimport old Sunday sheets or restore the older backup over current live data.
- Avoid altering the paid MD-20261025 invoice.

VALIDATION
- JavaScript source syntax and stock reconciliation with 2 November saved backup.
- iPhone Safari and live Supabase synchronization not end-to-end tested here.
- v0.10.136 retained as rollback.
