---
title: Intercompany balances that were never meant to clear
date: 2026-10-15
tags: IC, GL, cutover
---

During discovery, the trial balances looked reconcilable until intercompany was opened properly. Entity A showed a receivable. Entity B showed something that was not quite the mirror. The difference was not a rounding error. It was years of management fees, equipment charges, and “temporary” cross-charges that had never been settled under a single rule.

Nobody had applied a mysterious hold. The books had simply never been forced to agree.

Go-live plans often treat intercompany clean-up as a finance homework item. It is a cutover gate. If opening balances inherit unresolved IC, every later netting run and consolidation story starts on a crooked floor.

---

## What intercompany is doing in the process

In a multi-entity Fusion design, intercompany is not only a journal category. It is a set of rules for:

1. **Which entities** may transact with which
2. **How** the system generates the balancing side (receivable / payable, revenue / cost)
3. **When** settlement or netting is expected
4. **What** remains on the balance sheet until someone clears it

Implementation work usually configures the framework for *future* flows — automated invoices, monthly netting, clearing accounts. Cutover must still answer a harder question: **what do we put in the opening balances for everything that already happened?**

## Why “we’ll true up after go-live” fails

The face-value plan is familiar:

- Load opening balances from the legacy TB
- Map IC lines to clearing or control accounts
- Promise a post-go-live reconciliation project

That plan fails when:

- Entity A and Entity B never used the same economic event definitions
- One side booked revenue, the other booked a balance-sheet parking entry
- Currencies differ and legacy never revalued both sides the same way
- “Management fee” was booked inconsistently across years
- Netting was done in spreadsheets, not in the subledger

After go-live, the new IC engine produces clean *new* transactions. The old imbalance remains. Every period close then spends political capital explaining why IC still does not net to zero.

## What to check before cutover (in order)

1. **Pair the entities**  
   For each legal entity pair that will use IC, list the material cross-charge types (fees, rent, materials, labor, loans).

2. **Match the legacy story, not only the TB lines**  
   Can finance point to the same events on both sides? If not, the TB difference is not a mapping issue — it is a missing process.

3. **Separate clearable vs non-clearable**  
   - Clearable: both sides agree on amount and nature; settlement path exists  
   - Non-clearable as-is: one-sided bookings, write-off candidates, or items that need a governed opening adjustment

4. **Decide the opening treatment in writing**  
   For each bucket: settle before cutover, convert to an agreed opening IC balance, or write off / adjust in legacy with audit trail.

5. **Only then map to Fusion IC / clearing accounts**  
   Loading unexplained residual into a clearing account hides the problem for one month. It does not remove it.

6. **Test netting on the day-one design**  
   Use sample post-go-live transactions *and* confirm opening IC will not block the first real netting cycle.

## Resolution pattern

Treat material unresolved intercompany as a **pre-cutover workstream**, not a hypercare surprise.

- Agree amounts between entity controllers while legacy is still the system of record  
- Book settlement or adjustment where the evidence supports it  
- Carry into Fusion only balances that both sides accept  
- Configure IC so *new* activity cannot recreate the same unmanaged pile

Automation of invoices and monthly netting is valuable. It does not forgive an opening position that was never meant to clear.

---

> **Before go-live**  
> If Entity A’s receivable and Entity B’s payable cannot be tied to the same events and an agreed amount, do not load the difference into Fusion and hope netting will fix history. Netting manages the future. Opening IC is a decision about the past.

Clean intercompany after conversion is mostly discipline before conversion. The framework you configure in Fusion only protects you from the next pile — not from the one you imported on purpose.
