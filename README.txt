MAGIC DRAGON PIN v0.10.4 — CORRECTED SHARED KEYBOARD-SAFE FORM RULE

Built from verified v0.10.3.

ROOT CAUSE OF v0.10.3 FAILURE
The first shared keyboard helper relied on scrollIntoView().
Magic Dragon does NOT use the browser page as its normal scroll owner.
Each active app page (.section.active) is an absolute/fixed-shell scroll container.
On iPhone Safari, scrollIntoView() could therefore centre the barcode field against
the wrong viewport and push it above the visible screen when the keyboard opened.

CORRECT FIX
The helper now:
1. Finds the real app scroll owner, normally the current .section.active.
2. Reads Safari visualViewport to determine the area actually visible above the keyboard.
3. Intersects that area with the app's own scrollable section.
4. Calculates exactly how far the app scroll container must move.
5. Adjusts section.scrollTop directly.
6. Runs a second correction after Safari's native focus movement.
7. Rechecks several times during the keyboard animation.

BLUEPRINT / HANDOVER RULE — REVISED
For Magic Dragon mobile forms:
- The active .section is normally the scroll owner.
- Do NOT use window scrolling or scrollIntoView() as the primary keyboard fix.
- Move the real app scroll container directly using visualViewport-safe geometry.
- Keep focused fields visibly above the iPhone keyboard with surrounding context.
- New standard inputs should opt in with class="keyboardSafeInput".
- Special task editors may use their own dedicated keyboard manager.
- Editable mobile text remains >=16px to prevent Safari zoom.

APPLIED TO
- Product Catalogue shop barcode fields
- Add Product barcode fields

UNCHANGED
- Barcode storage and duplicate protection
- Barcode Dashboard routing
- Delivery Docket barcode graphic / A4 PDF
- Delivery editor specialised Qty keyboard handling
- Sunday workflow
- Suggested delivery / Combined Suggested Delivery
- Product archive/restore
- Invoices/payments
- Backup/restore

TEST
1. Dashboard > Barcode needed.
2. Tap a barcode field near the lower part of the catalogue.
3. Let keyboard fully open.
4. The selected barcode field should move into the visible area above the keyboard,
   not disappear above the top of the screen.
5. Type a barcode, dismiss keyboard and repeat on another lower field.
