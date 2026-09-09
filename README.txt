MAGIC DRAGON PIN v0.9.15 — SUNDAY CHAIN REPAIR TEST

Focused test build.

What is new:
- Rebuilds the Sunday-report chain branch-by-branch before reconciliation.
- Normalizes legacy branch labels so Lamai reports remain linked even if old imports used slightly different branch text.
- A valid 5–9 day gap is treated as the previous Sunday relationship.
- Lamai 23 Aug -> 30 Aug -> 6 Sep should now form one continuous chain.
- Archive status now shows the actual Previous Sunday date when a link exists.
- “Baseline / incomplete history” is no longer used for every unknown case: linked reports can show Mapping review or Incomplete product history instead.
- No payment, profit split, invoice, delivery-docket or archive-delete logic was changed.

Test:
1. Refresh App and confirm v0.9.15.
2. Open Sunday Import -> Sunday Report Archive.
3. Lamai 23 Aug should remain Baseline / incomplete history.
4. Lamai 30 Aug should show Previous Sunday: 2026-08-23.
5. Lamai 6 Sep should show Previous Sunday: 2026-08-30.
6. Expand Lamai 6 Sep reconciliation / Stock flow check and confirm the 2 Sep Lamai delivery quantities are used.
7. Do not delete or re-import the existing reports for this test.

Deployment: replace all seven files in the GitHub Pages repository root.
