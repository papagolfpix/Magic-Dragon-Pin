MAGIC DRAGON PIN v0.9.92 — SUNDAY SAFETY BUILD

Built from verified v0.9.91.

ADDED: BASELINE SNAPSHOT
- Settings > Product catalogue area now includes Safety snapshots.
- Create Baseline Snapshot stores a known-good snapshot locally on the device.
- It also immediately opens Share / Download using the same full JSON database payload.
- Suggested use: create one before Pin begins Sunday operation.

ADDED: SUPPORT BACKUP
- Create Support Backup produces a complete JSON snapshot for troubleshooting.
- Optional note can be included in the filename/payload.
- Uses iPhone native Share sheet when available.
- Can be sent to Paul by Mail / Messages / WhatsApp / AirDrop / Files.
- Does not alter app data.

ADDED: SUNDAY COMPLETION BACKUP OFFER
- After the Sunday save/completion action, the app offers to create/share a full support backup.
- This remains user-confirmed; no silent email/server is used.
- Reuses the proven JSON backup concept instead of introducing cloud sync before Sunday.

DELIVERY EDITOR POLISH
- Added mobile-safe styling hooks for existing editable docket rows.
- Edit mode heading now identifies Edit delivery docket instead of Create delivery where possible.
- No delivery calculations, totals, invoice logic or saved data structure changed.

PRESERVED
- v0.9.91 Product Catalogue layout
- Product parent/variant grouping
- Archive / Restore
- Suggested delivery dockets
- Combined suggested packing view
- Existing invoice/payment logic
- Existing backup/restore data

SUGGESTED TESTS
1. Settings > Product Catalogue > Create Baseline Snapshot.
   - Confirm Share sheet opens.
   - Confirm baseline status shows a timestamp.
2. Create Support Backup.
   - Add a short note.
   - Confirm one JSON file is shared.
3. Complete a test Sunday workflow.
   - Confirm the support-backup prompt appears only after completion.
4. Open an existing suggested delivery docket > Edit Docket.
   - Confirm edit screen is easier to read on iPhone.
   - Confirm Qty editing and remove buttons still work.
5. Return to Product Catalogue.
   - Confirm Archive / Restore still works.
6. Confirm Dashboard suggested dockets and Combined Suggested Delivery still open normally.
