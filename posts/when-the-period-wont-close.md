---
title: When the period won’t close
date: 2026-10-13
tags: GL, period-close
---

The period close process stopped at 97%. No error on the screen that explained anything useful. No obvious open invoice. Subledgers looked clean. Finance was waiting on “the system.”

The usual checklist had already been run: unposted journals, open receivables, pending approvals. All clear. The process monitor still refused to finish.

The blocker was not in the current period. It was a reversing journal from two periods earlier — marked for auto-reverse, never reversed, because the target period had already been closed when the reverse was supposed to post. The close program still saw work outstanding.

Period close problems are often not about the period you are trying to close.

---

## What “close” is actually doing

At a high level, period close is a sequence of checks and subprocesses, not a single switch. Typical concerns include:

1. Subledgers transferred / posted to the general ledger as required
2. Journals in the period posted (or deliberately left out under control)
3. Intercompany and balancing conditions satisfied where configured
4. Reversals, recurring journals, and auto-reverse candidates resolved
5. Module-specific close statuses (AP, AR, FA, etc.) in a state the GL close will accept

When the UI shows a percentage or a stuck process, the useful question is not “is close broken?” It is **which subprocess is waiting on what**.

## Why the face-value checklist fails

Teams re-check the same list every month:

- Unposted journals in this period
- Open AP/AR items everyone already knows about
- Pending invoice or journal approvals

That list catches common issues. It misses quiet ones that span periods:

- **Auto-reverse / reversing journals** whose reverse never posted because the target period was closed or not open
- **Recurring journals** still scheduled or partially generated
- **Incomplete subledger accounting** or transfer for a corner case transaction
- **Close process still running or failed** on a child step while the parent looks “almost done”
- **Prior-period adjustments** that left a dependency the current close still evaluates

The current period can be clean on the surface and still fail close because of unfinished work that *originated* earlier.

## What to check (in order)

1. **Process monitor / close status detail**  
   Which step is in progress, error, or waiting? Do not stop at the parent “Period Close” line.

2. **Unposted and incomplete journals in this period**  
   Including journals users assume are irrelevant (reversals, allocations, statistical).

3. **Auto-reverse and reversing candidates**  
   Journals set to reverse in this period or still pending reverse from prior periods. Confirm the reverse actually posted.

4. **Recurring journal batches**  
   Generated, partial, or stuck schedules that still touch the period.

5. **Subledger close and transfer**  
   AP, AR, FA (and others in scope): module period status, untransferred accounting, pending create accounting.

6. **Intercompany and balancing**  
   Outstanding IC batches or imbalance the close rules still enforce.

7. **Only then: “force” options and overrides**  
   After the dependency is understood. Skipping diagnosis turns a one-time stuck close into a recurring month-end fire.

## Resolution pattern

Most stuck closes are fixed by completing or clearing the **underlying dependency** (post the reverse, complete the subledger step, fix the journal), then re-running close — not by treating the percentage as the problem.

If the root is a prior-period reverse that can no longer post cleanly, the fix may be a controlled current-period entry plus process hygiene so the same pattern does not repeat next month.

---

> **When close hangs**  
> Read the subprocess, not only the parent status. Check reverses and recurrings across periods before arguing about this month’s invoices. The period you are closing is often not where the unfinished work began.

A close that stops at 97% is rarely a mystery gate in the UI. It is usually a dependency the checklist did not include — still open, still visible if you look one layer down.
