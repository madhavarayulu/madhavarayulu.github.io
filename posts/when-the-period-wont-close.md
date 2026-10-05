---
title: When the period won’t close
date: 2026-02-19
tags: GL, period-close, gotchas
---

The period close process stopped at 97%. No error. No warning. Just a quiet refusal to finish.

The usual suspects (unposted journals, open receivables, pending approvals) were clean. The real blocker was a single reversing journal from two periods ago that had been marked for auto-reverse but never actually reversed because the target period was already closed at the time.

Oracle remembered. The current period close did not forget.

**Practical sequence when a period hangs:**

1. Check the process monitor for the actual subprocess that stalled.
2. Look for auto-reverse and recurring journals that span periods.
3. Review the close checklist in reverse order — the last items are often the quiet ones.

Period close problems are rarely about the current period. They are almost always about something left unfinished earlier.
