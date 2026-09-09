MAGIC DRAGON PIN v0.9.14 — STOCK FLOW RECONCILIATION TEST

Focused test build.

What is new:
- Sunday reconciliation now includes a Stock flow check for every product.
- It compares previous Sunday closing stock, Yaowaret saved delivery dockets, and the current Sunday closing stock.
- Exact opening, delivery and closing differences are shown when they do not reconcile.
- Baseline/incomplete history remains grey and is not treated as zero.
- Product mapping issues remain review items, not guessed matches.
- No payment, profit split, archive or invoice calculation logic was changed in this build.

Test:
1. Refresh App and confirm v0.9.14.
2. Open Sunday Import and inspect the reconciliation for Lamai 2026-08-30 and 2026-09-06.
3. Expand Stock flow check.
4. Confirm each row shows Previous close, Saved deliveries, Sunday close and Difference.
5. Known matching rows should say Reconciles.
6. Any mismatch should show the exact opening/delivery/closing difference.
7. Baseline 2026-08-23 should remain History pending rather than assuming zero.

Deployment: replace all seven files in the GitHub Pages repository root.
