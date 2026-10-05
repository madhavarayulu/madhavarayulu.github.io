---
title: One business unit, many ledgers
date: 2026-04-09
tags: GL, architecture
---

A common design question: should each business unit have its own primary ledger?

Sometimes yes. Often no.

Multiple business units can share a ledger when they:

- Share the same chart of accounts and calendar
- Have similar accounting rules
- Do not need strict legal isolation at the ledger level

Separating ledgers too early creates extra period close work, more consolidation effort, and more places for configuration to drift.

Separate ledgers when there is a real legal, regulatory, or operational reason. Otherwise prefer fewer ledgers and clearer business unit design.
