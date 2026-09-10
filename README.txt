MAGIC DRAGON PIN v0.9.51 — FOCUSED DOCKET VIEWER TEST

This test build keeps the working v0.9.49 header/menu behavior and replaces the expanding in-place delivery-docket accordion with a stable focused viewer.

TEST FOCUS
1. Open Delivery Docket.
2. Tap each saved date in turn.
3. The date selector area stays in the same place.
4. The selected docket always appears in the same viewing zone underneath.
5. Scroll inside the docket body; the Edit / Delivered / Delete / Print buttons stay fixed at the bottom of the viewer.
6. Tap the selected date again to close the viewer.
7. Menu still auto-collapses after 5 seconds of inactivity.

DEPLOYMENT
Replace all 7 files in the GitHub Pages repository root, commit, wait for Pages deployment, then reopen/reload and confirm v0.9.51 in the black header.

v0.9.51 focused cleanup
- Removed Weekly Check from the normal main menu; the manual engine is retained only as a fallback capability.
- Locked the normal app shell so only page content scrolls; the branded header stays outside the scrolling pane.
- Matched the version badge width to the Menu button for a balanced header.
