# Kive Apps — kiveapps.github.io

Cinematic brand showroom and remote control platform for Kive Apps Android applications. Powered by GitHub Pages.

**Live:** [https://kiveapps.github.io](https://kiveapps.github.io)

## What This Does

- **Brand Showroom** — Cinematic home page, app showcases, blog, community, contact
- **App Pages** — Dedicated landing, privacy, and support pages per app
- **Internal APIs** — Hidden remote config endpoints consumed by Android apps (not publicly documented)

## Apps

| App | Slug | Status |
|-----|------|--------|
| LifeMaster AI | `lifemaster-ai` | Live |

## Public Pages

```
/                              → Home — brand showroom
/apps/lifemaster-ai/           → LifeMaster AI product page
/apps/lifemaster-ai/privacy/   → Privacy policy
/apps/lifemaster-ai/support/   → Support / donations
/blog/                         → Blog
/community/                    → Community
/contact/                      → Contact
```

## Project Structure

```
├── index.html                     # Home page (brand showroom)
├── 404.html                       # Custom 404 page
├── robots.txt                     # Crawler rules (blocks /api/)
├── sitemap.xml                    # Public page sitemap
├── icon.png                       # Brand icon
├── _DEVELOPER.md                  # Private dev docs (excluded from GH Pages)
├── assets/css/shared.css          # Cinematic design system v2
│
├── apps/lifemaster-ai/            # LifeMaster AI pages
│   ├── index.html                 # Product page
│   ├── icon.png                   # App icon
│   ├── privacy/index.html         # Privacy policy
│   └── support/index.html         # Support/donation
│
├── blog/index.html                # Blog
├── community/index.html           # Community
├── contact/index.html             # Contact
│
└── api/v1/apps/lifemaster-ai/     # Internal APIs (hidden)
    ├── config.json
    ├── announcements.json
    ├── notifications.json
    ├── popups.json
    └── features.json
```

## Adding a New App

1. Create `apps/{new-slug}/` with HTML pages (copy from lifemaster-ai)
2. Create `api/v1/apps/{new-slug}/` with JSON config files
3. Update home page showcase section
4. Point Android app to the API base URL

**Full instructions:** See [_DEVELOPER.md](_DEVELOPER.md)

---

 2026 Kive Apps