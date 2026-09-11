MAGIC DRAGON PIN v0.9.86 — SMART SUGGESTED DRAFT DOCKETS

Primary target: Pin on iPhone.
Focus: make Sunday suggested replenishment use the proven normal delivery-docket workflow.

Architecture change
- Removed the separate Suggested Delivery editor/state from day-to-day use.
- A Sunday suggestion is now created directly as a NORMAL UNSENT DELIVERY DOCKET.
- It uses the same Product / Qty / Cost / Retail / Cost Total rows as every other docket.
- Pin edits it using the existing Edit Docket screen.
- No special conversion step is needed.

Identification
- Suggested drafts receive a compact reference such as:
    SD-260906-BAN
    SD-260906-LAM
- The reference links the draft to the Sunday week and branch.
- Drafts retain sourceSundayDate and generatedFromSundaySuggestion metadata.

Dashboard
- Unsent suggested drafts appear directly on Pin's Dashboard.
- Each card shows branch, draft date, reference and total suggested units.
- Tapping a card opens that exact draft in the normal delivery editor.
- Once marked Delivered, it automatically disappears from the Dashboard suggestion area.

Safety repair
- UNSENT dockets no longer count as actual delivered stock in reconciliation.
- appDeliveryQty() and the legacy weekly delivery collector now count only dockets with deliveredAt.
- Legacy delivery inference will never auto-mark a Sunday suggested draft as delivered.
- affectedInvoiceForDocket() ignores unsent drafts.
- This makes saved/editable drafts genuinely consequence-free until Mark Delivered is used.

Migration
- Any v0.9.85 deliverySuggestions stored separately are migrated automatically into normal unsent draft dockets.
- Existing suggestion quantities and product/price snapshots are preserved.

Sunday rule
- Suggested quantity remains exactly the units sold in the reconciled Sunday week.
- No forecasting, safety stock, seasonality or reorder intelligence is added yet.

Test
1. Install v0.9.86 over v0.9.85.
2. Dashboard should show Bangrak/Lamai suggested delivery cards if suggestions exist.
3. Tap one card.
4. Confirm the NORMAL delivery editor opens with:
   Product | Qty | Cost | Retail | Cost total
5. Edit quantities/products and Save Docket Changes.
6. Return to Dashboard; the draft should still be available.
7. Open it from Delivery Dockets and Mark Delivered.
8. Return to Dashboard; that suggestion card should disappear.
9. Confirm an unsent suggested draft does not affect Sunday reconciliation delivery quantities.
