MAGIC DRAGON PIN v0.9.68 — SUNDAY REPORTS MODULE CLEANUP

Focused release:
- Sunday Reports now follows the same compact module pattern as Delivery Dockets.
- The normal import controls are collapsed behind a single “+ Import Reports” action.
- Saved Sunday reports remain in a compact selector list with one stable viewer directly below it.
- The selector list scrolls internally and keeps the active report visible without moving the whole page.
- Data Integrity diagnostics stay hidden during normal healthy operation and surface only when cleanup actually finds/removes a data issue.
- Delivery Branch and Date controls now use the same shared height and visual geometry.
- Existing Sunday Workflow lifecycle/reset and accounting logic are unchanged.

DEPLOYMENT
Replace all 7 files in the GitHub Pages repository root, commit, wait for deployment, then confirm v0.9.68 in the header.

TEST
1. Open Delivery Dockets > + New Delivery. Confirm Branch and Date are the same height.
2. Open Sunday Import. Confirm the page starts compact with “+ Import Reports”.
3. Tap + Import Reports and confirm the Excel import area opens in place.
4. In Sunday Report Archive, open several dates. Confirm each selected report appears in the same viewer zone below the selector list and does not jump to the bottom of the page.
5. Confirm Data Integrity is absent during normal healthy operation.
