MAGIC DRAGON PIN v0.9.95 — DELIVERY DOCKET EDITOR REPAIR

Built from verified v0.9.94.

PROBLEM
The saved Delivery Docket viewer was correct, but Edit Docket reused the Create Delivery presentation.
On iPhone this caused:
- heading reverting to Create delivery
- search/A–Z/new-line controls dominating the screen
- narrow/truncated product selectors
- nested/fixed-height scrolling that could trap the last product lines below the visible area

CLEAN REPAIR
Edit Docket is now a distinct presentation while still using the exact same delivery data and save engine.

EDIT MODE
- Correct heading: Edit delivery docket
- Existing lines display as full-width mobile cards
- Product selector gets the full available width
- Qty has a dedicated compact field
- Remove button remains visible
- Cost / retail / cost total appear as small secondary information
- Product lines remain in the original docket order
- Entire page uses normal scrolling in Edit mode
- Extra bottom safe-area padding ensures the final product and save controls can be reached above iPhone Safari chrome

ADDING A NEW LINE WHILE EDITING
- Search / A–Z / Product / Add Line tools are collapsed by default
- Tap “+ Add another product” to reveal the existing proven add-product controls
- Tap again to hide them
- No separate data path or duplicate editor was created

STATE SAFETY
- View mode remains unchanged
- Create Delivery mode remains unchanged
- Edit mode is driven explicitly by editingDocketId/editingSuggestionId
- Cancel and Save return to the normal saved-docket viewer
- Page position is preserved when changing a product or quantity during edit

UNCHANGED BUSINESS LOGIC
- delivery IDs
- suggested-docket references
- product IDs/prices
- Sunday reconciliation
- delivered/not-delivered state
- correction logic for already-delivered dockets
- invoice links
- audit log
- PDF generation
- archive/restore
- Combined Suggested Delivery
- baseline/support backups

TEST
1. Open Bangrak suggested docket from Dashboard.
2. Confirm viewer still looks exactly as before.
3. Tap Edit Docket.
4. Confirm heading says Edit delivery docket.
5. Confirm full product names are readable.
6. Scroll through every product and confirm the final product is reachable.
7. Change one Qty and scroll again; confirm position is stable.
8. Tap + Add another product and confirm search/A–Z/Add Line appear.
9. Hide those tools again.
10. Cancel and confirm the saved viewer returns unchanged.
11. Edit again, make a harmless change, Save Docket Changes and confirm the viewer opens with the saved result.
