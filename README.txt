MAGIC DRAGON PIN v0.9.48 — FOCUSED MOBILE SHELL / DOCKET FIX


WHAT CHANGED
- Black Magic Dragon header is physically fixed on normal screens.
- Menu stays attached directly below the fixed header while the page/content scrolls.
- Edit Docket keeps its top and bottom work areas stationary while only line items scroll in the middle.
- Dynamic correction choices no longer push the page/header upward when they appear.
- Saved Delivery Docket viewer now gives the opened docket body a true touch-scroll area; docket action buttons remain accessible below it.
- Opening a docket between other collapsed dates no longer clips the bottom of the docket.
- iPhone quantity entry retains the no-auto-zoom behavior and now releases focus after Add Line to avoid visual-viewport shunting.

WHAT CHANGED
- Menu opens below the fixed black header instead of covering it.
- Delivery Docket viewer uses fixed selector/header and fixed action controls with only the opened docket content scrolling between them.
- User-facing docket and Sunday-report labels use The Grocery by BM and BM Lamai while legacy internal branch keys remain stable.
- Newly generated Sunday archive filenames use the customer-facing branch names.
- Existing compact delivery editor, correction handling, paid-invoice rules and iPhone input fixes remain intact.

WHAT CHANGED
- Fixed Menu stacking so the full 3×3 menu opens below and above the sticky header layer.
- Fixed the delivery workspace so only the line-item list scrolls between the fixed entry controls and fixed save/correction controls.
- Prevented iPhone Safari auto-zoom on delivery quantity/edit controls by using an iOS-safe 16px control font size.
- Magic Dragon black header now remains visible throughout normal app use where practical.
- The permanent 3×3 navigation grid is hidden from the working screen. Tap Menu in the black header to drop it down; choosing a destination closes it again.
- Sunday Workflow remains a focused full-screen workflow without the normal header/menu.
- New/Edit Delivery is now a three-zone workspace: compact entry controls at the top, independently scrollable line items in the middle, and totals/correction/save controls fixed at the bottom.
- Existing docket lines remain dense, directly editable rows.
- Optional delivery note is collapsed by default to save vertical space, while existing notes reopen automatically when editing.
- Editing status is reduced to a compact chip rather than a large explanatory banner.
- Correction choices are compact tap rows; the radio control is explicitly sized to prevent the giant iPhone selection-box bug.
- Unpaid affected invoices still offer only Update this invoice or Add to next Sunday’s invoice.
- Paid affected invoices remain immutable and corrections automatically carry to the next Sunday invoice.
- False partial-invoice correction amounts remain blocked whenever an edited week is not fully reconciled.

SPACE-SAVING DIRECTION
The delivery workspace now prioritizes the active controls and current lines. Help, optional notes and navigation are progressively disclosed rather than permanently consuming screen space.

DEPLOYMENT
Deploy all 7 files in this ZIP to the GitHub Pages repository root, commit, wait for Pages, open the app, tap Refresh App, and confirm v0.9.48.

Files:
Magic-Dragon-logo.jpeg
README.txt
icon-192.png
icon-512.png
index.html
manifest.webmanifest
sw.js
