# kiveapps.github.io

> **Private repo overview.** This file is excluded from GitHub Pages output.

The public marketing site for Kive Apps + the encrypted-API artifact target.

**Live:** https://kiveapps.github.io

---

## What this repo holds

```
Public marketing pages (served by GitHub Pages):
  index.html                     → Home (cinematic brand showroom)
  apps/lifemaster-ai/            → LifeMaster AI product, privacy, support
  blog/                          → Blog
  community/                     → Community
  contact/                       → Contact
  404.html                       → Custom 404
  robots.txt                     → Crawler rules
  ai.txt                         → AI training opt-out
  sitemap.xml                    → Public sitemap
  assets/css/shared.css          → Cinematic design system
  assets/js/shared.js            → Shared JS (modal, confetti, reveals)

Encrypted API artifacts (CI-generated, do not edit by hand):
  d/<hash>/<hash>.bin            → Encrypted endpoints
  m/<hash>.bin                   → Encrypted manifests
  decoys/<hash>.bin              → Decoy files

Configuration:
  _config.yml                    → Jekyll: lists private files to exclude

Private docs (Jekyll-excluded, dev-only):
  _DEVELOPER.md                  → Master index
  _ARCHITECTURE.md               → Security architecture & threat model
  _API_REFERENCE.md              → All 11 endpoint schemas
  _ANDROID_INTEGRATION.md        → Kotlin SDK reference
  _BUILD.md                      → Daily ops + incident response
  _AI_AGENT_GUIDE.md             → Operating instructions for AI assistants
  README.md                      → This file
```

---

## How content gets here

- **Marketing HTML** is committed by hand (or by Cascade/Windsurf when asked).
- **Encrypted artifacts** under `/d/`, `/m/`, `/decoys/` are pushed automatically by the GitHub Actions workflow in the **private** companion repo (`kiveapps/kiveapps-source`).
- **Private docs** live here for proximity to the codebase but are excluded from Pages output via `_config.yml`.

---

## Don't push these here

- ❌ Plaintext source JSON for any endpoint (those live only in `kiveapps-source`)
- ❌ The master encryption secret
- ❌ Any developer's personal name in marketing copy
- ❌ Any working URL pointing to a `_*.md` file

---

## Where to start as a dev

1. Read `_DEVELOPER.md` (master index)
2. Read `_AI_AGENT_GUIDE.md` if you're (or your AI is) implementing
3. Read `_ARCHITECTURE.md` to understand the why
4. Read `_API_REFERENCE.md` when adding/editing endpoint data

---

© 2026 Kive Apps
