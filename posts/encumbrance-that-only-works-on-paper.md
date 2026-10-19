---
title: Encumbrance that only works on paper
date: 2026-10-19
tags: BCEA
---

Budget owners were confident. Encumbrance was “on.” Requisitions and POs were supposed to consume funds. Payments to subcontractors still slipped through against projects that had already exhausted their control balances — not because someone overrode a hard stop, but because the stop was never in the path the business actually used.

On paper, budgetary control was implemented. In the process people ran day to day, commitment was optional, partial, or arrived too late.

Encumbrance is not a module you switch on. It is a chain: budget → control budget → reservation at the right document → liquidation at the right event. Break any link and the reports still look controlled while cash does not.

---

## What the process is supposed to do

In a controlled Procure-to-Pay design with Budgetary Control / encumbrance:

1. A **control budget** defines what can be spent (accounts, projects, periods, amounts).
2. A **requisition** (or equivalent) **reserves** funds when submitted or approved.
3. A **purchase order** continues or converts that commitment.
4. **Receipts and invoices** liquidate commitment and move toward actuals per the configured rules.
5. **Hard stops** (when enabled) block documents that would exceed available funds.

Finance often hears “BCEA is configured.” Operations experience only whether a document **fails** when funds are insufficient — at the step they actually use.

## Why “we turned on encumbrance” fails

Common gaps:

- Control budget exists, but the **segments** on req/PO (project, cost centre, account) do not match how budget was loaded
- Reservation fires on PO, while the business commits earlier at **requisition** — or the reverse
- **Summary vs detail** budgets: users buy against a detail the parent never funded the way they think
- Overriding or using document types / paths that **bypass** the controlled calendar or tree
- Invoices matched to POs that never reserved, or to non-PO paths with no commitment step
- Periods and budget dates that do not cover the transaction date the user is booking

The configuration workbook can say complete. The payment still posts because the transaction never entered the controlled tunnel.

## What to check (in order)

1. **Which document reserves?**  
   Req only, PO only, both? Does the business create reqs at all for the spend that matters?

2. **Control budget definition**  
   Tree, accounts, projects, date ranges, hard vs soft control. Who can override, and is override audited?

3. **Segment values on real documents**  
   Pick five recent POs that “should have been blocked.” Do their project/account combinations exist in the control budget with available funds logic you expect?

4. **Liquidation rules**  
   When does commitment release — receipt, invoice, payment? Mismatches create phantom available funds or stuck commitments.

5. **Non-PO and manual paths**  
   Expense reports, manual invoices, journals: in or out of control? If out, the largest leaks are often here.

6. **UAT with failed paths, not only happy paths**  
   Deliberately exhaust a control balance and attempt req → PO → invoice. If nothing stops, the design is not done.

## Resolution pattern

Align three things in writing before calling BCEA live:

- **Where** the business commits (req vs PO vs both)
- **What** the control budget actually funds (dimensions and calendar)
- **What** is allowed outside the controlled path (and who owns that risk)

Then test a **negative** case end-to-end. A green configuration checklist without a blocked document is theatre.

For construction-style spend — subcontractor IPCs, retention, project-coded POs — the cost of a paper-only control is not a report variance. It is payment against a project that was already out of funds while the system stayed polite.

---

> **Control is a path, not a flag**  
> If the documents people use never reserve against the budget you loaded, encumbrance is documentation. Prove one hard stop in UAT on the real path before you trust the monthly budget report.

Budgetary control earns its name only when a transaction that should fail, fails — at the step the business cannot avoid.
