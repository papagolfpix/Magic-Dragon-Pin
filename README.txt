MAGIC DRAGON PIN v0.9.93 — SMALL STABILITY PATCH

Built from verified v0.9.92.

1. DASHBOARD SUGGESTED-DOCKET ROUTING
- The Dashboard suggestion card now explicitly clears create/edit mode first.
- It switches to the Delivery Dockets tab/archive state.
- It waits briefly for the view to settle.
- It then expands the requested saved suggested docket.
- This is intended to eliminate the intermittent first-tap opening of the wrong create/edit screen.
- Docket data, pricing, quantities, PDF and delivery logic are unchanged.

2. TEST SUNDAY BACKUP PROMPT
Settings > Product catalogue > Safety snapshots now includes:
- Test Sunday Backup Prompt

This:
- does NOT alter Sunday reports
- does NOT create an invoice
- does NOT reconcile anything
- simply triggers the same confirmation/support-backup flow used after Sunday completion

PRESERVED
- Combined Suggested Delivery unchanged
- Product families and variants
- Archive / Restore
- Baseline Snapshot
- Support Backup
- Existing invoice/payment logic
- Existing backup/restore data
- Delivery docket viewer/editor logic aside from the Dashboard routing reset

TEST
A. From Dashboard, tap the Bangrak suggested docket once.
   Confirm it opens the saved-docket viewer directly.
B. Return Home and tap Lamai once.
   Confirm it opens correctly first time.
C. Repeat each once more if desired.
D. Settings > Product catalogue > Safety snapshots > Test Sunday Backup Prompt.
   Confirm it says TEST ONLY and opens the Support Backup flow if accepted.
E. Confirm Combined Suggested Delivery still works unchanged.
