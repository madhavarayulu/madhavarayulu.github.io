# Cairn — field notes by Madhava Rayulu

> Field notes from an Oracle Fusion Finance functional consultant — implementations,
> process design, and the edge cases official documentation misses.

**Read at [madhavarayulu.github.io](https://madhavarayulu.github.io/)**

## Why "Cairn"

Above the treeline the trail stops being a trail. What keeps you from wandering off
is a pile of stones somebody stacked before you arrived — a stranger's twenty minutes
balancing rocks so you don't get lost. This blog is that pile, made of words instead
of granite: field notes, gotchas, and half-finished thoughts, stacked one on top of
another as they come.

## What you'll find

Practical writing on Oracle Fusion Finance from the implementation trenches:
deployment realities, release cycles, financial process design, and the edge cases
that official documentation quietly skips.

## How it's built

- **Zero-framework SPA** — vanilla JS hash router, Markdown rendered with
  [marked](https://github.com/markedjs/marked)
- **Static entry pages** — a small Node script (`generate-entries.js`) pre-renders
  each post to `/entry/<slug>/` with full Open Graph / Twitter meta for SEO and
  share unfurls
- **Instant loading** — `posts.json` generated at build time; the SPA renders from
  it without round-trips
- **CI/CD** — GitHub Actions regenerates entries, `posts.json`, and `sitemap.xml`
  on every push to `main`, then deploys to GitHub Pages
- **Installable** — PWA manifest with maskable icons; add to home screen on
  Android or iOS and Cairn opens standalone
- **A single canonical mark** — every favicon, app icon, and share card derives
  from one SVG cairn; palette and stone geometry never drift

## Repository structure

~~~text
├── index.html               # SPA shell — home, archive, trailhead, entries
├── generate-entries.js      # Markdown → static pages, posts.json, sitemap
├── posts/                   # Source notes (.md, front-matter driven)
├── entry/                   # Generated static pages (do not edit by hand)
├── templates/entry.html     # Template for generated pages
├── posts.json               # Build-time post index for the SPA
├── sitemap.xml              # Generated on every push
├── robots.txt               # Points crawlers at the sitemap
├── manifest.webmanifest     # PWA manifest
├── favicon.png              # 192 px — Google SERP + Safari
├── apple-touch-icon.png     # 180 px — iOS home screen
├── cairn-maskable-512.png   # 512 px maskable — Android launcher
├── cairn-favicon.svg        # The canonical mark
├── cairn-card-wide.png      # 1200 × 628 share card
└── assets/                  # Spare rasters (16 / 32 / 48 px)
~~~

## Publishing a note

Add a Markdown file to `posts/` and push to `main`:

~~~markdown
---
title: The note's title
date: 2026-01-09
tags: fusion, receivables
series: optional-series-name   # optional
part: 2                        # optional, with series
verified: 2026-02-01           # optional — "verified on" stamp
draft: false                   # true = skip generation
---
Body in Markdown.
~~~

The workflow does the rest: static page, SPA index, sitemap entry, navigation
links between adjacent posts.

## Colophon

Set in Fraunces, Newsreader, and Spline Sans Mono. Palette and mark cut from a
single canonical cairn. No trackers, no analytics, no framework — just stones.

*Writing © Madhava Rayulu. The code is yours to learn from.*
