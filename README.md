# Kive Apps — kiveapps.github.io

Central hub for all Kive Apps Android applications. Serves as a public website, JSON API center, and remote configuration platform — all powered by GitHub Pages.

**Live:** [https://kiveapps.github.io](https://kiveapps.github.io)

## What This Does

- **Public Website** — Home page, privacy policies, support pages, contact forms
- **JSON API Center** — Remote config endpoints that Android apps fetch on launch
- **Remote Control** — Push announcements, trigger updates, show popups, toggle features — without releasing a new app version

## Apps

| App | Slug | Status |
|-----|------|--------|
| LifeMaster AI | `lifemaster-ai` | Live |

## Project Structure

```
├── index.html                          # Home page
├── icon.png                            # Brand icon
├── assets/css/shared.css               # Shared design system
├── privacy/index.html                  # LifeMaster AI privacy policy
├── support/index.html                  # LifeMaster AI support/donation
├── contact/index.html                  # Contact form (email routing)
├── updates/index.html                  # Release notes / changelog
├── docs/index.html                     # Developer documentation
└── api/v1/apps/lifemaster-ai/
    ├── config.json                     # App config & version control
    ├── announcements.json              # In-app announcements
    ├── notifications.json              # Push notification triggers
    ├── popups.json                     # Remote dialog/popup triggers
    └── features.json                   # Feature flags & remote config
```

## API Base URL

```
https://kiveapps.github.io/api/v1/apps/{app-slug}/
```

## Quick Reference

| Endpoint | Purpose |
|----------|---------|
| `config.json` | App version, update requirements, maintenance mode, links |
| `announcements.json` | In-app banners and announcements |
| `notifications.json` | Remote notification triggers (pull-based) |
| `popups.json` | Remote dialogs, bottom sheets, overlays |
| `features.json` | Feature flags, remote config, kill switch |

## Adding a New App

1. Create `api/v1/apps/{new-slug}/` with all 5 JSON files
2. Add app pages (privacy, support, etc.)
3. Update home page to list the new app
4. Point the Android app to `https://kiveapps.github.io/api/v1/apps/{new-slug}/`

## Documentation

Full developer docs: [https://kiveapps.github.io/docs/](https://kiveapps.github.io/docs/)

---

© 2026 Kive Apps