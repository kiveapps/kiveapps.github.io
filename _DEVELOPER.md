# Kive Apps — Developer Documentation

> **Private documentation for managing the Kive Apps GitHub Pages project.**  
> This file is NOT linked anywhere on the website — it's your personal reference.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [URL Structure](#url-structure)
3. [Adding a New App](#adding-a-new-app)
4. [API Endpoints](#api-endpoints)
5. [Remote Actions](#remote-actions)
   - [Force Update](#force-update)
   - [Soft Update](#soft-update)
   - [Maintenance Mode](#maintenance-mode)
   - [Kill Switch](#kill-switch)
   - [Announcements](#announcements)
   - [Popups](#popups)
   - [Notifications](#notifications)
   - [Feature Flags](#feature-flags)
6. [Email Routing](#email-routing)
7. [Android Integration](#android-integration)
8. [Quick Reference](#quick-reference)

---

## Project Overview

This GitHub Pages site serves as:
- **Public website** — Home page, app landing pages, privacy policies, support pages
- **JSON API center** — Remote configuration endpoints for Android apps
- **Control panel** — Edit JSON files to control app behavior without releasing updates

**Live URL:** `https://kiveapps.github.io`

---

## URL Structure

```
/                                    → Home (all apps hub)
/apps/{slug}/                        → App landing page
/apps/{slug}/privacy/                → App privacy policy
/apps/{slug}/support/                → App support/donation page
/apps/{slug}/updates/                → App release notes
/apps/{slug}/contact/                → App contact form
/api/v1/apps/{slug}/                 → App JSON APIs
/docs/                               → Public developer documentation
```

### Current Apps

| App Name | Slug | Package ID |
|----------|------|------------|
| LifeMaster AI | `lifemaster-ai` | `com.kive.lifemaster` |

---

## Adding a New App

### Step 1: Create App Pages

Create the following folder structure:
```
apps/{new-slug}/
├── index.html          # App landing page
├── icon.png            # App icon (512x512 recommended)
├── privacy/index.html  # Privacy policy
├── support/index.html  # Support/donation page
├── updates/index.html  # Release notes
└── contact/index.html  # Contact form
```

**Tip:** Copy from `apps/lifemaster-ai/` and do find-replace:
- Replace `LifeMaster AI` with your app name
- Replace `lifemaster-ai` with your app slug
- Replace `com.kive.lifemaster` with your package ID
- Update icon.png
- Update privacy policy content
- Update support page UPI details (if different)

### Step 2: Create API Endpoints

Create the following folder structure:
```
api/v1/apps/{new-slug}/
├── config.json         # App config & version control
├── announcements.json  # In-app announcements
├── notifications.json  # Push notification triggers
├── popups.json         # Remote dialogs/popups
└── features.json       # Feature flags
```

**Tip:** Copy from `api/v1/apps/lifemaster-ai/` and update:
- `app.id` → your package ID
- `app.name` → your app name
- `app.slug` → your app slug
- `links.*` → update all URLs to use new slug
- `api_endpoints.base_url` → update to new slug

### Step 3: Update Home Page

Edit `index.html` and add your app to the apps grid:

```html
<div class="app-showcase fi">
  <img class="app-showcase-icon" src="apps/{new-slug}/icon.png" alt="Your App">
  <div class="app-showcase-body">
    <h3 class="app-showcase-name">Your App Name</h3>
    <p class="app-showcase-tag">Your tagline</p>
    <p class="app-showcase-desc">Your description.</p>
    <div class="app-showcase-links">
      <a href="/apps/{new-slug}/" class="app-link">App Page</a>
      <a href="/apps/{new-slug}/privacy/" class="app-link">Privacy</a>
      <a href="/apps/{new-slug}/support/" class="app-link">Support</a>
      <a href="/apps/{new-slug}/updates/" class="app-link">Updates</a>
    </div>
  </div>
</div>
```

### Step 4: Update Navigation (Optional)

If you want the app in the main nav, update the nav links in `index.html` and `docs/index.html`.

### Step 5: Configure Android App

In your Android app, set the API base URL:
```kotlin
const val API_BASE = "https://kiveapps.github.io/api/v1/apps/{new-slug}/"
```

---

## API Endpoints

### Base URL
```
https://kiveapps.github.io/api/v1/apps/{app-slug}/
```

### Endpoints

| File | Purpose |
|------|---------|
| `config.json` | App version, update requirements, maintenance, links |
| `announcements.json` | In-app banners and announcements |
| `notifications.json` | Remote notification triggers (pull-based) |
| `popups.json` | Remote dialogs, bottom sheets, overlays |
| `features.json` | Feature flags, kill switch, custom config |

---

## Remote Actions

### Force Update

**When:** Critical bug fix, security patch, breaking change

**Edit:** `api/v1/apps/{slug}/config.json`

```json
{
  "version": {
    "latest": "2.0.0",
    "latest_code": 10,
    "min_supported": "2.0.0",
    "min_supported_code": 10
  },
  "update": {
    "mandatory": true,
    "title": "Update Required",
    "message": "This update includes critical fixes. Please update to continue.",
    "cta_label": "Update Now"
  }
}
```

**Result:** All users on versions < 10 see a non-dismissible update dialog.

---

### Soft Update

**When:** New features, improvements, non-critical fixes

**Edit:** `api/v1/apps/{slug}/config.json`

```json
{
  "version": {
    "latest": "1.5.0",
    "latest_code": 8,
    "min_supported": "1.0.0",
    "min_supported_code": 1
  },
  "update": {
    "mandatory": false,
    "recommended": true,
    "title": "Update Available",
    "message": "A new version is available with improvements!",
    "dismiss_for_days": 3
  }
}
```

**Result:** Users see a dismissible update prompt. Shows again after 3 days if dismissed.

---

### Maintenance Mode

**When:** Server issues, planned downtime, emergency

**Edit:** `api/v1/apps/{slug}/config.json`

```json
{
  "maintenance": {
    "enabled": true,
    "title": "Under Maintenance",
    "message": "We're improving things. Back shortly!",
    "estimated_end": "2026-04-15T18:00:00+05:30",
    "allow_offline_use": true
  }
}
```

**Result:** Users see maintenance screen. If `allow_offline_use` is true, they can still use offline features.

---

### Kill Switch

**When:** Critical security issue, legal requirement, emergency shutdown

**Edit:** `api/v1/apps/{slug}/features.json`

```json
{
  "features": {
    "kill_switch": true
  }
}
```

**Result:** App is completely disabled for all users.

---

### Announcements

**When:** Welcome new users, announce features, time-limited events

**Edit:** `api/v1/apps/{slug}/announcements.json`

```json
{
  "announcements": [
    {
      "id": "diwali-2026",
      "type": "event",
      "title": "Happy Diwali! 🪔",
      "message": "Wishing you light and joy this Diwali.",
      "display": {
        "style": "banner",
        "position": "top",
        "dismissible": true,
        "show_once": false,
        "max_impressions": 3
      },
      "schedule": {
        "start_date": "2026-10-19T00:00:00+05:30",
        "end_date": "2026-10-22T23:59:59+05:30"
      },
      "active": true
    }
  ]
}
```

**Announcement Types:** `info`, `warning`, `success`, `promo`, `update`, `event`

**Display Styles:** `banner`, `card`, `fullscreen`, `snackbar`, `inline`

---

### Popups

**When:** Important messages, surveys, rate prompts, changelogs

**Edit:** `api/v1/apps/{slug}/popups.json`

#### Rate the App
```json
{
  "id": "rate-app-v1",
  "type": "rating",
  "title": "Enjoying the app?",
  "message": "A quick rating helps others discover it.",
  "primary_button": { "label": "Rate Now", "action": "open_play_store" },
  "secondary_button": { "label": "Maybe Later", "action": "dismiss" },
  "display": { "show_once": false, "frequency_hours": 720 },
  "targeting": { "days_since_install_min": 7, "sessions_min": 5 },
  "active": true
}
```

#### What's New (Changelog)
```json
{
  "id": "whats-new-v2",
  "type": "changelog",
  "title": "What's New in v2.0",
  "message": "• New dashboard\n• Dark mode\n• Bug fixes",
  "primary_button": { "label": "Got it", "action": "dismiss" },
  "display": { "show_once": true, "show_on_app_open": true },
  "targeting": { "version_code_min": 10, "version_code_max": 10 },
  "active": true
}
```

**Popup Types:** `dialog`, `bottom_sheet`, `fullscreen`, `rating`, `survey`, `changelog`, `force_update`

---

### Notifications

**When:** Remind users, announce updates (pull-based, not real-time)

**Edit:** `api/v1/apps/{slug}/notifications.json`

```json
{
  "notifications": [
    {
      "id": "update-reminder",
      "title": "New Version Available!",
      "body": "Update now for the latest features.",
      "channel": "updates",
      "action": { "type": "open_play_store" },
      "schedule": { "preferred_time": "10:00" },
      "active": true
    }
  ]
}
```

**Note:** This is pull-based. Notifications appear when the app runs, not in real-time.

---

### Feature Flags

**When:** Toggle features, A/B testing, gradual rollouts

**Edit:** `api/v1/apps/{slug}/features.json`

```json
{
  "features": {
    "show_support_banner": true,
    "show_rating_prompt": false,
    "show_onboarding": true,
    "maintenance_mode": false,
    "kill_switch": false
  },
  "custom_flags": {
    "enable_new_dashboard": true,
    "max_daily_goals": 10,
    "beta_features": false
  }
}
```

---

## Email Routing

Users see `kive.apps@gmail.com` but emails are routed via Gmail's `+` aliasing:

| Purpose | User Sees | Actual Recipient |
|---------|-----------|------------------|
| Support | kive.apps@gmail.com | kive.apps+support@gmail.com |
| Contact | kive.apps@gmail.com | kive.apps+contactus@gmail.com |

### Gmail Filters

Set up filters to auto-label incoming emails:

**Filter 1: Support**
- Matches: `to:kive.apps+support@gmail.com`
- Action: Apply label `Kive/Support`

**Filter 2: Contact Us**
- Matches: `to:kive.apps+contactus@gmail.com`
- Action: Apply label `Kive/ContactUs`

---

## Android Integration

### 1. Define API URLs

```kotlin
object KiveApi {
    private const val BASE = "https://kiveapps.github.io/api/v1/apps/"
    
    fun config(slug: String) = "$BASE$slug/config.json"
    fun announcements(slug: String) = "$BASE$slug/announcements.json"
    fun notifications(slug: String) = "$BASE$slug/notifications.json"
    fun popups(slug: String) = "$BASE$slug/popups.json"
    fun features(slug: String) = "$BASE$slug/features.json"
}
```

### 2. Fetch on App Startup

```kotlin
suspend fun fetchRemoteConfig() {
    try {
        val config = httpClient.get(KiveApi.config("lifemaster-ai"))
        val features = httpClient.get(KiveApi.features("lifemaster-ai"))
        // ... cache locally
    } catch (e: Exception) {
        // Use cached values — app works offline
    }
}
```

### 3. Processing Priority

```
1. Kill switch       → features.kill_switch
2. Maintenance       → config.maintenance.enabled
3. Mandatory update  → config.version.min_supported_code
4. Recommended update→ config.update.recommended
5. Popups            → popups (filtered by targeting)
6. Announcements     → announcements (filtered by targeting)
7. Notifications     → notifications (schedule locally)
```

### 4. Caching Strategy

- Cache all responses locally
- Use `features.remote_config.cache_duration_minutes` for refresh interval
- Always fall back to cached data if network fails
- Hardcode default values as ultimate fallback

---

## Quick Reference

### File Locations

```
/                           → index.html (home page)
/apps/{slug}/               → apps/{slug}/index.html
/apps/{slug}/privacy/       → apps/{slug}/privacy/index.html
/apps/{slug}/support/       → apps/{slug}/support/index.html
/apps/{slug}/updates/       → apps/{slug}/updates/index.html
/apps/{slug}/contact/       → apps/{slug}/contact/index.html
/api/v1/apps/{slug}/*.json  → api/v1/apps/{slug}/*.json
/docs/                      → docs/index.html
```

### Common Tasks

| Task | File to Edit |
|------|--------------|
| Force update all users | `api/v1/apps/{slug}/config.json` |
| Show maintenance screen | `api/v1/apps/{slug}/config.json` |
| Emergency kill switch | `api/v1/apps/{slug}/features.json` |
| Add announcement banner | `api/v1/apps/{slug}/announcements.json` |
| Show popup dialog | `api/v1/apps/{slug}/popups.json` |
| Toggle feature flag | `api/v1/apps/{slug}/features.json` |
| Update release notes | `apps/{slug}/updates/index.html` |
| Update privacy policy | `apps/{slug}/privacy/index.html` |

### Deployment

1. Edit files locally
2. Commit and push to GitHub
3. Changes are live within 1-2 minutes (GitHub Pages CDN)

---

## Notes

- **GitHub Pages CDN:** Files are cached for ~10 minutes. For urgent changes, users will see updates within 10 minutes of pushing.
- **JSON Validation:** Always validate JSON before pushing. Invalid JSON will break the app's remote config.
- **Backward Compatibility:** When adding new fields to JSON, ensure the Android app handles missing fields gracefully.
- **Testing:** Test changes locally using `python -m http.server 8080` before pushing.

---

*Last updated: April 2026*
