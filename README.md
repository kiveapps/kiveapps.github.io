# Kive Apps — kiveapps.github.io

Central hub for all Kive Apps Android applications. Serves as a public website, JSON API center, and remote configuration platform — all powered by GitHub Pages.

**Live:** [https://kiveapps.github.io](https://kiveapps.github.io)

## What This Does

- **Public Website** — Home page, app landing pages, privacy policies, support pages
- **JSON API Center** — Remote config endpoints that Android apps fetch on launch
- **Remote Control** — Push announcements, trigger updates, show popups, toggle features — without releasing a new app version

## Apps

| App | Slug | Status |
|-----|------|--------|
| LifeMaster AI | `lifemaster-ai` | Live |

## URL Structure

```
/                                    → Home (all apps hub)
/apps/{slug}/                        → App landing page
/apps/{slug}/privacy/                → App privacy policy
/apps/{slug}/support/                → App support/donation
/apps/{slug}/updates/                → App release notes
/apps/{slug}/contact/                → App contact form
/api/v1/apps/{slug}/                 → App JSON APIs
/docs/                               → Developer documentation
```

## Project Structure

```
├── index.html                          # Home page
├── icon.png                            # Brand icon
├── _DEVELOPER.md                       # Private docs (excluded from GitHub Pages)
├── assets/css/shared.css               # Shared design system
├── docs/index.html                     # Public API documentation
│
├── apps/lifemaster-ai/                 # LifeMaster AI app pages
│   ├── index.html                      # App landing page
│   ├── icon.png                        # App icon
│   ├── privacy/index.html              # Privacy policy
│   ├── support/index.html              # Support/donation
│   ├── updates/index.html              # Release notes
│   └── contact/index.html              # Contact form
│
└── api/v1/apps/lifemaster-ai/          # LifeMaster AI API
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

1. Create `apps/{new-slug}/` with all HTML pages (copy from existing app)
2. Create `api/v1/apps/{new-slug}/` with all 5 JSON files
3. Update home page to list the new app
4. Point the Android app to `https://kiveapps.github.io/api/v1/apps/{new-slug}/`

**Full instructions:** See [_DEVELOPER.md](_DEVELOPER.md)

## Documentation

- **Public docs:** [https://kiveapps.github.io/docs/](https://kiveapps.github.io/docs/)
- **Private docs:** [_DEVELOPER.md](_DEVELOPER.md) (excluded from GitHub Pages)

---

 2026 Kive Apps