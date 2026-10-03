---
title: "Oracle Fusion GL: Configuring Reconciliation — A Step-by-Step Guide"
date: 2025-01-29
lastmod: 2025-01-29
categories: ["Configurations"]
tags: ["GL", "Reconciliation", "Fusion Cloud", "General Ledger", "Close"]
description: "A practical configuration walkthrough for setting up General Ledger reconciliation in Oracle Fusion Cloud Financials."
draft: false
---

## Context

Reconciliation in Oracle Fusion General Ledger ensures that subledger balances tie to GL balances, and that GL balances are accurate before close. Setting it up correctly saves hours during month-end.

This post covers the configuration steps for a standard reconciliation setup.

**Tested on:** Fusion Cloud 24B. Navigation paths may vary slightly by release.

## Symptoms of a Missing or Broken Reconciliation Setup

- Subledger and GL balances don't tie.
- Close checklist items fail.
- Reconciliation reports show unexplained variances.
- Manual spreadsheet reconciliation becomes the norm.

## Configuration Steps

### Step 1: Define Reconciliation Accounts

Navigate to: **General Ledger → Period Close → Reconciliation → Manage Reconciliation Accounts**

Create or verify reconciliation accounts for each balance sheet account that needs reconciliation. These are typically:

- Cash and bank accounts
- Intercompany accounts
- Accrual accounts
- Clearing accounts

For each account, specify:
- Reconciliation type (e.g., Bank, Intercompany, Subledger)
- Tolerance amount and percentage
- Preparer and approver assignments

### Step 2: Configure Reconciliation Tolerances

Navigate to: **General Ledger → Period Close → Reconciliation → Manage Reconciliation Tolerances**

Set tolerance rules that determine when a reconciliation is considered complete. A common setup:

| Tolerance Type | Amount | Percentage |
|---|---|---|
| Warning | 100 | 0.1% |
| Error | 500 | 0.5% |

Adjust based on materiality and audit requirements.

### Step 3: Set Up Subledger Reconciliation

For each subledger (Payables, Receivables, Assets, etc.):

1. Navigate to: **Subledger → Period Close → Reconciliation → Manage Subledger Reconciliation**
2. Select the subledger application
3. Map subledger accounts to GL reconciliation accounts
4. Define the reconciliation method (e.g., Balance, Activity)

### Step 4: Configure Close Checklist

Navigate to: **General Ledger → Period Close → Close Checklist → Manage Close Checklist**

Add reconciliation tasks to the close checklist. Assign:
- Task owner
- Due date (relative to period end)
- Dependency on prior tasks

This ensures reconciliation happens before close, not after.

### Step 5: Test with a Sandbox Period

Run through a full reconciliation cycle in a test pod or sandbox period before going live:

1. Enter representative transactions in the subledger.
2. Transfer to GL.
3. Run reconciliation reports.
4. Verify tolerances behave as expected.
5. Verify the close checklist triggers correctly.

## Prevention

- Review reconciliation accounts whenever new balance sheet accounts are added.
- Update tolerances when materiality thresholds change.
- Train preparers and approvers on the reconciliation workflow.
- Run reconciliation reports mid-period, not just at close.

## References

- Oracle Fusion Cloud Financials — General Ledger documentation
- Oracle Fusion Cloud Financials — Period Close documentation
- Oracle Fusion Cloud Financials — Subledger Reconciliation documentation

---

*This is one stone. If you've configured reconciliation differently, share your approach — the cairn is stronger with more stones.*
