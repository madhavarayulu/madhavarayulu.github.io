---
title: FBDI migration: the mock cutover is the real project
date: 2026-10-17
tags: FBDI, migration, cutover
---

The first mock cutover finished at 87%. Suppliers loaded with warnings. Open invoices partially rejected. A handful of records looked fine in the CSV and failed in the load. The room treated it as a dress rehearsal for the templates.

It was not. It was the first time the *data* met the *model*.

By the final mock, success was high enough to trust the weekend. Almost nothing about that improvement was “better FBDI skill.” It was cleaner sources, fewer ambiguous suppliers, and rules for what would not be loaded at all.

The templates are the pipe. The mock cutover is where you learn what cannot go through the pipe.

---

## What FBDI is doing in the process

File-Based Data Import is a structured path from spreadsheet or extract into Fusion:

1. Extract or build data in the required shape (headers, lines, parent/child keys)
2. Validate against the template and basic file rules
3. Load into interface tables
4. Import into application tables
5. Review errors, correct source or mapping, repeat

For cutover, the important objects are rarely glamorous: suppliers, open AP invoices, open AR, trial balance / balances, assets, employees-as-suppliers — whatever must exist on Monday morning for the business to operate.

Configuration can be perfect and cutover still fail if the files describe a world Fusion will not accept.

## Why “we’ll fix it in the load weekend” fails

The face-value plan:

- Map legacy fields to FBDI columns
- Run one technical mock
- Reserve the real weekend for volume

That plan underestimates:

- **Supplier hierarchy** — legacy flat vendor lists vs site / address / bank structure
- **Duplicates** — same supplier under three codes; merge rules undecided until error logs force the meeting
- **Open transactions** that reference inactive projects, closed POs, or tax codes not in scope
- **Balances** that do not foot to the agreed trial balance
- **Encoding and date formats** that pass a visual check and fail the import
- **Dependencies** — invoices before suppliers, banks before payment methods, COA values before journals

Each mock that only “tests the tool” wastes a cycle. Each mock that **changes the source rules** compounds.

## What to check across mocks (in order)

1. **Scope list, written**  
   What is in cutover load vs conversion vs day-one manual vs out of scope. Unscoped data becomes weekend noise.

2. **Source quality before template beauty**  
   Deduplicate suppliers, agree active sites, freeze who owns the golden list.

3. **Referential order**  
   Parents before children. Foundations before transactions. Document the load sequence and stick to it.

4. **Error log as product backlog**  
   Group errors by root cause (missing value, invalid reference, duplicate, business rule). Assign each group an owner. Do not only re-export the same file.

5. **Reconcile counts and amounts**  
   Legacy extract total vs loaded total vs rejected total. “File accepted” is not “books agree.”

6. **Repeat until the delta is boring**  
   The last mock should produce no new *classes* of error — only known rejects with a written disposition.

7. **Cutover runbook**  
   Who runs which file, in which order, with which success criteria, and what happens when a threshold is missed (go / no-go).

## Resolution pattern

Treat mock cutovers as **data design iterations**, not IT rehearsals.

- Improve the source and the business rules after every mock  
- Shrink the load to what must be true on day one  
- Accept that some history stays in legacy archive rather than forced into Fusion  
- Measure readiness by stable reconciliations, not by “we ran FBDI once”

A jump from messy first-mock results to a calm final mock is mostly governance of the data — keys, duplicates, references, and explicit rejects — not heroics on the weekend.

---

> **Readiness test**  
> If the error log still produces *new kinds* of failure, you are still discovering the data model. You are not ready to call the next run “production cutover.”

FBDI will move what you give it within the rules. The mock cutover is where you decide what is fit to give it — and what was never going to survive contact with the new system.
