---
title: The hold nobody applied
date: 2026-10-06
tags: AP, matching
---

An AP invoice sat on hold for eleven days. The hold said *price mismatch*. The buyer insisted the price was right. The PO price on the screen matched the invoice. AP still could not pay.

The invoice was fine. The purchase order was fine. The mismatch was three weeks old and lived on a different line entirely — a receipt booked against line 2 instead of line 3.

The matching engine does not hold grudges. It holds arithmetic. It was comparing the right numbers, just not the numbers anyone was looking at.

> A hold name describes a **symptom**. It rarely names the transaction history that produced it.

---

## What the process is doing

In a standard Procure-to-Pay flow with matching enabled:

1. A purchase order is created with one or more lines (item, quantity, price).
2. Goods or services are received against those lines.
3. The supplier invoice is entered and matched to the PO and/or receipt.
4. The matching engine compares quantities and amounts using the match option and tolerances on the supplier site and the PO.

A **price mismatch** hold means the engine found a price or amount difference it is not allowed to ignore. It does not mean the invoice header is wrong. It means some combination of PO line, receipt, and invoice line failed the comparison.

## Why the face-value check fails

The usual response is to open the invoice, open the PO, and compare the visible price. Necessary — and incomplete.

Matching runs at **line level**. It uses the receipt picture as it exists *now*, not as people remember it.

Typical causes when “the prices look the same”:

- Receipt booked against the **wrong PO line** (line 2 instead of line 3)
- Quantity or price **corrected on the receipt** after an earlier match attempt
- Invoice line matched to a different PO line than the one the business is discussing
- Partial receipt / partial match left residual quantities that no longer align with the invoice
- Supplier site or PO match option stricter than expected (for example 3-way match with a tight price tolerance)

The hold is not random. It is comparing numbers. Those numbers are not always the ones on the screens people are arguing about.

## What to check (in order)

1. **Invoice hold details** — Hold type, which invoice line is held, and the PO/receipt references on that line.
2. **PO lines** — Line numbers, prices, quantities ordered / received / billed.
3. **Receipts against those lines** — Which receipt(s)? Which PO line did each receipt post to? Any corrections, reversals, or quantity adjustments after the original receipt?
4. **Match attempt** — What did the system actually try to match (invoice line → PO line → receipt)? Do not assume it used the line the buyer is talking about.
5. **Tolerances and match option last** — Supplier site and PO: 2-way vs 3-way, price and quantity tolerances — only after the line story is clear.

## Resolution pattern

Most of the time the fix is not “override the hold.” It is correcting the receipt or the match relationship so the arithmetic agrees, then re-matching.

Widening tolerances or forcing an override silences this invoice. It does not fix the next one that hits the same broken receipt trail.

---

> **When the hold doesn’t match the story**  
> Stop debating the invoice header alone. Reconstruct the path: PO line → receipt(s) → invoice line. Treat the hold name as a pointer to a failed comparison, not as the full diagnosis.

Eleven days of an unpaid supplier for a thirty-minute correction is expensive in ways that never show up on a dashboard. The hold was applied by the matching rules. The mystery was in the history.
