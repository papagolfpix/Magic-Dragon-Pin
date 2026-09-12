MAGIC DRAGON PIN v0.10.3 — SHARED MOBILE KEYBOARD-SAFE INPUT RULE

Built from verified v0.10.2.

FIX
When editing a shop barcode on iPhone, Safari could open the keyboard and move the active field above the visible area.

A new reusable keyboard-safe input module now:
- watches Safari visualViewport changes
- waits through the keyboard opening animation
- checks whether the focused field is above/below the visible viewport
- scrolls the field back into a safe, visible position
- keeps a generous margin above the keyboard
- rechecks position while Safari adjusts the visual viewport

APPLIED NOW
- Product Catalogue barcode fields
- Add Product barcode fields

DELIVERY EDITOR
Delivery Docket Qty fields keep their specialised v0.9.98 keyboard behaviour.
The shared module deliberately does not interfere with those Qty fields.

BLUEPRINT / HANDOVER RULE — MOBILE INPUTS
Treat keyboard-safe focus handling as a standard UI rule for Magic Dragon Pin:
1. Any new mobile text/number input should use the shared keyboard-safe helper unless the screen has its own dedicated keyboard manager.
2. Focused controls must remain visible above the iPhone keyboard.
3. Do not rely on Safari's default focus scrolling.
4. For task-specific editors (such as Delivery Docket Qty), specialised keyboard positioning may override the shared helper.
5. Keep main editable text at 16px or greater on iPhone to avoid Safari focus zoom.
6. Test fields near the top and bottom of long scrollable screens before releasing a build.

HOW TO OPT IN FUTURE FIELDS
- add class="keyboardSafeInput"
OR
- call mobileKeyboardSafeFocus(this) on focus and mobileKeyboardSafeBlur(this) on blur.

NO BUSINESS LOGIC CHANGED
Barcode storage, duplicate protection, Delivery Docket barcode rendering/PDF, Sunday workflow, invoices, archive/restore and backups are unchanged.

TEST
1. Dashboard > Barcode needed.
2. Tap a barcode field low down the Product Catalogue.
3. Confirm keyboard opens.
4. Confirm the active field remains visible above the keyboard.
5. Type/edit barcode.
6. Dismiss keyboard and continue normally.
7. Repeat using Add Product barcode inputs.
