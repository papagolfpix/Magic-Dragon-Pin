MAGIC DRAGON PIN v0.9.98 — COMPACT + KEYBOARD-AWARE DELIVERY EDITOR

Built from verified v0.9.97.

REQUESTED EDIT-SCREEN CHANGES

1. REMOVE DELIVERY MODULE NAVIGATION WHILE EDITING
Hidden during Edit Docket:
- “Delivery dockets”
- “Create a new delivery or open a saved docket.”
- “+ New Delivery”

These remain present in normal Delivery Dockets view/create mode.

2. COMPACT BRANCH / DATE
- Branch and Date controls reduced to 32px high.
- Readable input text remains 16px.
- Labels and surrounding spacing reduced.

3. DELIVERY NOTE HIDDEN DURING EDIT
- Delivery note is not shown in the Edit Docket workspace.
- Existing saved note data is NOT deleted or changed.
- Create Delivery behavior is unchanged.

4. PRODUCT LIST COMPACTED
- Product cards use less vertical padding.
- Product selector remains 16px.
- Qty remains 16px.
- Cost/Retail/Cost total stay secondary.
- Remove control stays visible.
- More products fit in the available middle viewport.

KEYBOARD SOLUTION — OPTION 1 + OPTION 2

OPTION 1: KEYBOARD-AWARE AUTO-POSITIONING
- Uses iPhone/Safari visualViewport when available.
- When a Qty field is focused, the app detects the keyboard-reduced visible area.
- The active product card is automatically scrolled into a safe visible position above the keyboard.
- A second correction runs after Safari’s own focus animation to avoid the field being covered.
- The active product card receives a subtle highlight while editing.

OPTION 2: HIDE BOTTOM ACTION BAR WHILE TYPING
- While the numeric keyboard is open:
    Total cost
    Cancel
    Clear Lines
    Save Docket Changes
  are temporarily hidden.
- The freed space is given to the scrolling product list.
- When the keyboard closes, the fixed bottom controls return automatically.

QTY REPLACEMENT
- Existing Qty is selected automatically on focus.
- Typing a new number replaces it instead of appending.

PRESERVED
- only products scroll during normal Edit mode
- fixed compact top zone
- fixed bottom action zone when keyboard is closed
- saved-docket viewer
- delivery data/pricing
- suggested delivery logic
- Sunday reconciliation
- Combined Suggested Delivery
- invoices/payments
- archive/restore
- backup/restore
- PDF/audit history

TEST
1. Open a suggested docket > Edit Docket.
2. Confirm Delivery dockets / + New Delivery are gone.
3. Confirm Branch/Date are significantly shorter.
4. Confirm Delivery note is gone.
5. Confirm product cards are tighter.
6. Scroll near the bottom of the list.
7. Tap a Qty.
8. Confirm existing number is selected.
9. Confirm bottom actions disappear while keyboard is open.
10. Confirm active Qty/product card moves into clear view above keyboard.
11. Type a replacement number.
12. Dismiss keyboard.
13. Confirm bottom actions return.
14. Save and verify the saved-docket viewer reflects the change.
