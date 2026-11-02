---
title: Bank payment files and the last mile of fraud control
date: 2026-11-02
tags: AP, payments, banking
---

Inside the ERP, an invoice can be approved, matched, and scheduled for payment. That still does not mean the money left the company safely.

The last step is often a payment file sent to the bank: a structured list of beneficiaries, accounts, amounts, and references. If that file can be changed after approval, or if the bank has no independent check against what finance intended, the controls upstream matter less than people think.

This note is about that last mile: payment file generation, bank validation, and the checks that separate “posted in Oracle” from “safe at the bank.”

## What happens after payment is approved

A simplified path looks like this:

1. Invoices are approved and become available for payment.
2. A payment process selects invoices, applies payment methods, and groups payments.
3. The system generates payment instructions for the bank. That may be an electronic file, a host-to-host message, or another bank-specific format.
4. The bank processes the instructions and moves funds.
5. Bank statements come back for reconciliation.

Most project workshops spend a long time on steps 1 and 2. Step 3 is treated as a technical interface. Fraud and error risk often live exactly there.

## Why “it paid from Oracle” is not the full control story

Oracle can ensure that only approved invoices enter a payment run. That is necessary. It is not always sufficient.

Risks appear when:

- The payment file can be edited after it is generated and before it reaches the bank.
- Bank account details on the supplier record are weak, duplicated, or changed without dual review.
- The bank accepts the file without checking it against a separate confirmation channel.
- Positive pay or equivalent controls are not used, so the bank has no independent list of intended payments.
- Returned bank statements are reconciled late, so a bad payment is discovered after the trail is cold.

In other words, the ERP may control the business decision to pay, while the file channel still allows a different payment to be executed.

## Controls that belong in the design

When you design or review AP payments, make these questions explicit:

**1. How do supplier bank details get created and changed?**  
Who can add or edit account numbers? Is there approval for changes? Are changes logged and reviewed?

**2. What payment methods are in scope?**  
Electronic funds transfer, cheque, bank transfer formats, and country-specific methods do not carry the same risks or the same file controls.

**3. How is the payment file produced and delivered?**  
Is it generated automatically and sent through a secure host-to-host connection, or downloaded and uploaded by a person? Manual handling increases tampering risk.

**4. Does the bank validate payments independently?**  
Positive pay and similar services let the company send the bank a list of intended payments. The bank then pays only what matches. If that is available with your bank, treat it as part of the control design, not as an optional extra.

**5. Who can re-issue or regenerate a file?**  
A failed transmission should not become an informal “edit the file and try again” process without audit.

**6. How quickly do you reconcile?**  
Bank statement import and reconciliation close the loop. A clean payment run with delayed reconciliation leaves a blind period.

## A practical review sequence

If payments are already live, or if you are preparing for go-live, walk through one real payment end to end:

1. Start from an approved invoice and the supplier’s bank account record.
2. Confirm who was allowed to create or change that bank account.
3. Run or inspect the payment process and see exactly when the bank instructions are created.
4. Confirm whether any human can alter beneficiary or amount data after that point.
5. Confirm what the bank checks before releasing funds.
6. Confirm how the payment appears on the bank statement and how it is reconciled in the system.

If step 4 or step 5 is unclear, the control story is incomplete even if invoice approval is strong.

## What good looks like

A solid design usually has all of the following:

- tight governance on supplier bank account master data
- payment creation based on approved system data, not re-typed amounts
- secure transmission to the bank
- bank-side validation where the bank product supports it
- clear operational procedures for failed files and re-work
- timely statement reconciliation

None of that replaces invoice matching and approval. It protects the moment when approved intent becomes actual cash movement.

## Takeaway

Payment controls are a chain. Approval inside the ERP is one link. The payment file, the bank’s validation, and reconciliation are the links that complete it.

If your design description ends at “payment process request completed in Oracle,” you have described the instruction, not the full control. Follow the money one step further: into the file, into the bank, and back through the statement.

That last mile is where many real losses and near misses occur. It deserves the same design attention as matching rules and approval hierarchies.
