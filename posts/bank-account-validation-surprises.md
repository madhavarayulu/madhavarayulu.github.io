---
title: Bank account validation surprises
date: 2026-03-28
tags: Cash Management, gotchas
verified: 25A
---

Bank account validation in Fusion can fail for reasons that are not obvious from the error message.

Common quiet causes:

- The bank branch is inactive or not linked to the correct country.
- The account number format does not match the validation rule for that bank/country.
- The IBAN is correct but the BIC/SWIFT is missing or mismatched.
- The account is valid but the supplier site is still pointing at an old, end-dated bank account.

When validation fails, check the bank reference data first, then the account itself, then the site assignment. The error almost always points at the account. The real issue is frequently one level above or below.
