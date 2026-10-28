---
title: Retention and 3-way match in construction AP
date: 2026-10-28
tags: AP, matching, construction
---

In many construction projects, the client does not pay the full value of the work as soon as it is done. A percentage is held back on purpose. That held amount is called retention. It is meant to protect the client if defects appear later or if the contractor does not finish the job properly.

That commercial rule is normal. It becomes a problem inside an ERP when the purchase order, the receipt, and the supplier invoice do not tell the same story about what is due now and what is being held.

This note explains why standard three-way matching often struggles with retention, and what to decide before you rely on matching to control subcontractor payments.

## A simple picture of the business process

Imagine a subcontractor is hired to do work worth 100,000. The contract says 10% will be retained until the defects liability period ends.

When the first progress certificate is approved, the work certified might be 40,000. Retention on that certificate is 4,000. The amount actually due to the supplier now is 36,000.

So three different numbers matter at the same time:

- the value of work certified
- the retention held back
- the net amount payable now

The finance system has to know which of those numbers belongs on the purchase order, which belongs on the invoice, and which should sit as a liability until retention is released later.

## What three-way matching is trying to do

Three-way matching compares three documents:

1. the purchase order (what was ordered)
2. the receipt or acceptance (what was acknowledged)
3. the supplier invoice (what the supplier is billing)

The system checks whether quantities and amounts are consistent within the tolerances you configured. If they are not, it places the invoice on hold.

That logic works well when you order 10 laptops, receive 10 laptops, and get an invoice for 10 laptops. It works less well when the “order” is a long-term contract, the “receipt” is a progress certificate, and the invoice is only for the net amount after retention.

## Where the confusion usually starts

The confusion usually starts with one unanswered question:

**Is the purchase order written for the gross value of the work, or for the net amount that will be paid after retention?**

If the purchase order line is 40,000 and the invoice is 36,000, matching may see a price or amount mismatch even though both documents are commercially correct.

If the purchase order line is 40,000 and the invoice is also 40,000, matching may pass, but the system has not recorded that 4,000 should not be paid yet. Someone then has to handle retention outside the system, often in a spreadsheet.

Both situations create noise. In the first case, AP fights holds that are not really errors. In the second case, the books look matched while the retention balance lives somewhere else.

## Other common mismatches

A few other patterns show up often in construction AP:

- The receipt records physical progress, while the invoice follows the commercial certificate. Those two numbers are related, but they are not always identical.
- Retention is described in the contract text but never built into the purchase order lines or the accounting setup.
- Retention is later released through a manual invoice with no clear link back to the original purchase order.
- Suppliers invoice the gross amount one month and the net amount the next, depending on how their own billing team works.

None of these is mainly a matching engine failure. They are signs that the commercial rule was never translated into a stable document design.

## Decisions you need to make on purpose

Before you lean on three-way matching for subcontractor invoices, agree on answers to these questions:

1. **What does the purchase order represent?**  
   Is each line the gross certified work, the net payable amount, or a structure with separate lines for work and retention?

2. **What does the supplier invoice represent?**  
   Will suppliers bill net of retention, or bill gross with a clear retention line, or send a separate document when retention is released?

3. **What does “receipt” mean in this process?**  
   Is it confirmation of quantities, acceptance of a certificate amount, or only a technical step to satisfy three-way matching?

4. **Where does the retained amount live in the accounts?**  
   It should be visible as a liability or another controlled balance, not only as a note in a project folder.

5. **How will retention be released later?**  
   Will there be a second invoice, a purchase order change, or another approved document that can be matched and audited?

If these answers are unclear, matching will keep producing exceptions that look technical and are actually commercial.

## A practical way to test the design

Do not only test one happy invoice that matches one purchase order.

Walk through a full mini-story in testing:

1. Create the purchase order under the chosen gross or net model.
2. Record the progress acceptance the way the business will really do it.
3. Enter the progress invoice the way suppliers will really bill.
4. Confirm whether matching passes for the right reason.
5. Confirm that the retained amount is visible in the system.
6. Later, process the retention release and confirm the liability clears cleanly.

If step 4 only works because someone widened tolerances, the design is not finished. If step 5 depends on a spreadsheet, the design is not finished either.

## Takeaway

Three-way matching checks whether documents agree with each other. Retention is a rule about paying less than the full certified value for a period of time.

Those two ideas only work together when the purchase order, the receipt, and the invoice are built around the same commercial story. If one document speaks in gross amounts and another speaks in net amounts, the system will either block good invoices or accept incomplete ones.

Write down whether your process is gross or net. Encode that choice in the documents and accounts. Then test both the progress payment and the later retention release.

Matching can enforce arithmetic. It cannot invent the business rule you never defined.
