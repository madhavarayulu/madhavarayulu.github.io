---
title: Supplier site vs supplier
date: 2026-03-03
tags: AP, configuration
---

A surprising amount of AP configuration pain comes from treating “Supplier” and “Supplier Site” as the same thing.

They are not.

- **Supplier** holds the legal entity, tax, and high-level controls.
- **Supplier Site** holds the operational details: payment method, bank accounts, invoice matching options, site-specific holds.

When a payment method “disappears,” or matching rules behave differently for the same supplier across business units, the site level is usually where the answer lives.

Most configuration documents talk about the supplier. Most real problems live one level down.
