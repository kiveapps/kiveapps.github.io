# Kive Apps — API Reference

> **Private document.** Excluded from GitHub Pages output.

This is the canonical schema reference for every encrypted endpoint produced by the build pipeline. Each endpoint is a JSON file under `_source/<app-slug>/v<version>/<endpoint>.json` in the `kiveapps-source` private repo.

## Common envelope

Every decrypted payload arrives wrapped in this envelope:

```json
{
  "v": 1,
  "t": 1714162800000,
  "ttl": 86400,
  "app": "lifemaster-ai",
  "vc": 1,
  "ep": "config",
  "d": { /* schema below */ }
}
```

The `d` field is the actual data; the rest is metadata for replay/freshness validation. Apps consume `d` and verify the rest. See `_ARCHITECTURE.md` §6.

---

## 1. `config`

App-level configuration: version control, maintenance mode, links, refresh intervals.

```json
{
  "schema_version": 1,
  "app": {
    "id": "com.kive.lifemaster",
    "name": "LifeMaster AI",
    "slug": "lifemaster-ai",
    "tagline": "The Discipline OS for Focus, Recovery & Growth",
    "publisher": "Kive Apps"
  },
  "version": {
    "latest_name": "1.0.0",
    "latest_code": 1,
    "min_supported_name": "1.0.0",
    "min_supported_code": 1,
    "release_date": "2026-04-01"
  },
  "update": {
    "mandatory": false,
    "recommended": false,
    "title": "Update Available",
    "message": "...",
    "cta_label": "Update Now",
    "dismiss_label": "Later",
    "dismiss_for_hours": 72,
    "show_after_version_code": 0,
    "play_store_url": "..."
  },
  "maintenance": {
    "enabled": false,
    "title": "...",
    "message": "...",
    "estimated_end_iso": null,
    "allow_offline_use": true
  },
  "links": { /* freeform key→URL map */ },
  "support_contact": {
    "email_display": "kive.apps@gmail.com",
    "response_time_hours": 48
  },
  "refresh": {
    "manifest_interval_minutes": 60,
    "endpoints_interval_minutes": 180,
    "critical_endpoints_interval_minutes": 15,
    "critical_endpoints": ["emergency", "blockers", "config"]
  }
}
```

**Client behavior:**
- If `version.min_supported_code > installed_version_code` → mandatory update.
- If `update.recommended && installed_version_code < version.latest_code` → soft prompt.
- If `maintenance.enabled` → show maintenance screen (respect `allow_offline_use`).
- Refresh intervals tell the client how often to re-fetch each kind of endpoint.

---

## 2. `announcements`

In-app banners. Skippable, non-skippable, timed, permanent.

```json
{
  "schema_version": 1,
  "announcements": [
    {
      "id": "diwali-2026",
      "type": "event|info|warning|success|promo|update",
      "title": "Happy Diwali 🪔",
      "message": "Wishing you a season of light...",
      "image_url": null,
      "display": {
        "style": "banner|card|fullscreen|snackbar|inline",
        "position": "top|bottom|center",
        "dismissible": true,
        "permanent": false,
        "show_once": false,
        "max_impressions": 3,
        "min_seconds_visible": 0
      },
      "schedule": {
        "start_iso": "2026-10-19T00:00:00+05:30",
        "end_iso": "2026-10-22T23:59:59+05:30"
      },
      "targeting": {
        "segments": ["all_users"],
        "min_version_code": null,
        "max_version_code": null,
        "countries_allow": [],
        "countries_block": []
      },
      "action": {
        "primary": { "label": "Got it", "type": "dismiss" },
        "secondary": null
      },
      "active": true
    }
  ]
}
```

**`display.permanent: true`** → banner stays until manually dismissed by an `emergency` or `announcements` update setting `active: false`. Useful for warnings that must remain.

**Action types:** `dismiss`, `open_url`, `open_play_store`, `open_screen:<route>`, `external_email`, `none`.

---

## 3. `notifications`

Pull-based scheduled notifications (the app generates local notifs from these on a schedule).

```json
{
  "schema_version": 1,
  "notifications": [
    {
      "id": "morning-checkin",
      "title": "Time for your morning check-in",
      "body": "How are you starting today?",
      "channel": "reminders",
      "icon": "ic_notification_morning",
      "action": {
        "type": "open_screen|open_url|open_play_store|none",
        "value": "/journal/today"
      },
      "schedule": {
        "type": "daily|weekly|once|interval",
        "preferred_time": "07:30",
        "days_of_week": [1, 2, 3, 4, 5],
        "start_iso": null,
        "end_iso": null,
        "min_interval_hours": 12
      },
      "targeting": {
        "segments": ["engaged_users"],
        "min_version_code": null,
        "premium_tier_in": []
      },
      "active": true
    }
  ]
}
```

---

## 4. `popups`

Modal dialogs, ratings, surveys, changelogs.

```json
{
  "schema_version": 1,
  "popups": [
    {
      "id": "rate-prompt-v1",
      "type": "dialog|bottom_sheet|fullscreen|rating|survey|changelog",
      "title": "Enjoying LifeMaster AI?",
      "message": "A quick rating helps others discover it.",
      "image_url": null,
      "primary_button": { "label": "Rate Now", "action": "open_play_store" },
      "secondary_button": { "label": "Maybe Later", "action": "snooze:30d" },
      "tertiary_button": null,
      "display": {
        "show_once": false,
        "frequency_hours": 720,
        "show_on_app_open": true,
        "delay_seconds": 5,
        "max_impressions": 3
      },
      "targeting": {
        "segments": ["rate_candidates"],
        "min_version_code": null
      },
      "active": true
    }
  ]
}
```

**Snooze actions:** `snooze:7d`, `snooze:30d`, `snooze:permanent`, `dismiss`, `open_url:<url>`, `open_screen:<route>`.

**Special types:**
- `rating` — auto-routes to Play Store on tap.
- `changelog` — pre-formatted markdown body, "Got it" CTA.
- `survey` — multi-question; `d` includes a `questions[]` array.

---

## 5. `blockers`

App-level / screen-level / feature-level blockers. The most general primitive — every other "block this user from X" feature can be built on top of this.

```json
{
  "schema_version": 1,
  "blockers": [
    {
      "id": "force-update-block",
      "scope": "app|screen|feature|region|time_window",
      "target": null,
      "title": "Update Required",
      "message": "This version is no longer supported. Please update.",
      "action": {
        "type": "force_update|hard_block|soft_block|redirect",
        "cta_label": "Update Now",
        "cta_url": "https://play.google.com/store/apps/details?id=com.kive.lifemaster"
      },
      "schedule": {
        "start_iso": null,
        "end_iso": null
      },
      "targeting": {
        "segments": ["all_users"],
        "min_version_code": null,
        "max_version_code": 0,
        "countries_allow": [],
        "countries_block": []
      },
      "active": false
    }
  ]
}
```

**Scope semantics:**
- `app` — entire app is blocked. `hard_block` shows a non-dismissible screen.
- `screen` — `target` is the route (e.g., `"/coaching/advanced"`). User can navigate elsewhere.
- `feature` — `target` is a feature flag id. The flag silently behaves as `false` for the user.
- `region` — block applies in matching `countries_block` (uses device locale).
- `time_window` — block applies during `schedule.start_iso..end_iso`.

**Action types:**
- `force_update` — non-dismissible, must update.
- `hard_block` — non-dismissible, no escape (kill switch).
- `soft_block` — dismissible warning; feature still works.
- `redirect` — sends user to `cta_url` (e.g., FAQ, status page).

---

## 6. `features`

Feature flags + rollout percentages + custom config.

```json
{
  "schema_version": 1,
  "global_flags": {
    "show_support_banner": true,
    "show_rating_prompt": false,
    "enable_voice_coach": true
  },
  "rollouts": [
    {
      "flag_id": "new_dashboard_v2",
      "default": false,
      "percentage": 10,
      "segments_force_on": ["beta_testers"],
      "segments_force_off": []
    }
  ],
  "custom_config": {
    "max_daily_goals": 10,
    "coaching_tip_refresh_hours": 24
  }
}
```

**Rollout logic:** Client computes a stable hash `H = HMAC(install_id, flag_id) % 100`. If `H < percentage` AND user is not in `segments_force_off` → flag is on. Forced-on segments override.

---

## 7. `premium`

Subscription tiers, per-user grants, trial control.

```json
{
  "schema_version": 1,
  "tiers": [
    {
      "id": "free",
      "name": "Free",
      "features": ["basic_coaching", "daily_goals", "journal", "offline_mode"]
    },
    {
      "id": "premium",
      "name": "Premium",
      "features": ["...", "advanced_coaching", "voice_coach"]
    }
  ],
  "default_tier": "free",
  "trial": {
    "enabled": false,
    "tier_granted": "premium",
    "duration_days": 7,
    "one_time_only": true
  },
  "user_grants": {
    "<user_hash_prefix_8_hex>": {
      "tier": "lifetime",
      "granted_at_iso": "2026-04-15T10:00:00Z",
      "expires_at_iso": null,
      "note": "Refunded purchase honored"
    }
  }
}
```

**`user_hash_prefix`** = first 8 hex chars of `HMAC(USER_HASH_KEY, install_id || android_id)`.

**Multiple users with same prefix** (collision): store all under `"<prefix>"` as `[{...}, {...}]` array; client matches on full hash if needed. With 8-hex (32-bit) prefix, collisions are very rare for small grant lists.

---

## 8. `segments`

User segmentation rules. Other endpoints reference segments by id in their `targeting`.

```json
{
  "schema_version": 1,
  "segments": [
    {
      "id": "engaged_users",
      "name": "Engaged users (>5 sessions)",
      "criteria": {
        "days_since_install_min": null,
        "days_since_install_max": null,
        "sessions_min": 5,
        "sessions_max": null,
        "premium_tier_in": [],
        "version_code_min": null,
        "version_code_max": null,
        "has_rated_app": null,
        "countries_allow": [],
        "countries_block": []
      }
    }
  ]
}
```

A user matches a segment iff **every non-null criterion is satisfied**. Empty arrays are ignored.

---

## 9. `experiments`

A/B test definitions and variant assignments.

```json
{
  "schema_version": 1,
  "experiments": [
    {
      "id": "exp_onboarding_2026q2",
      "name": "Onboarding flow A/B/C",
      "active": true,
      "variants": [
        { "id": "control", "weight": 50, "config": { "flow": "classic" } },
        { "id": "variant_a", "weight": 25, "config": { "flow": "minimal" } },
        { "id": "variant_b", "weight": 25, "config": { "flow": "story" } }
      ],
      "start_iso": "2026-04-20T00:00:00Z",
      "end_iso": "2026-05-20T00:00:00Z",
      "targeting": { "segments": ["new_users"] }
    }
  ]
}
```

**Assignment is sticky per device:** `variant = experiment.variants[ HMAC(install_id, exp_id) % sum(weights) ]`. Client memoizes the assignment locally so users don't get reshuffled mid-experiment.

---

## 10. `content`

Dynamic content: daily quotes, coaching tips, challenges. Lets us refresh content without an app update.

```json
{
  "schema_version": 1,
  "daily_quotes": ["...", "...", "..."],
  "coaching_tips": [
    {
      "id": "tip-focus-1",
      "category": "focus|recovery|growth|discipline",
      "title": "The Two-Minute Rule",
      "body": "If a task takes less than two minutes..."
    }
  ],
  "challenges": [
    {
      "id": "30day-cold-shower",
      "name": "30-day cold shower",
      "description": "...",
      "duration_days": 30,
      "active": true,
      "targeting": { "segments": ["all_users"] }
    }
  ]
}
```

---

## 11. `emergency`

Last-resort controls. Highest priority — checked **first** on every refresh.

```json
{
  "schema_version": 1,
  "kill_switch": {
    "enabled": false,
    "title": null,
    "message": null,
    "allow_offline_use": false,
    "wipe_local_data": false
  },
  "force_logout": {
    "enabled": false,
    "reason": null,
    "user_segments": [],
    "after_version_code": null
  },
  "global_lock": {
    "enabled": false,
    "title": null,
    "message": null,
    "until_iso": null,
    "regions": []
  },
  "data_purge": {
    "enabled": false,
    "scopes": [],
    "user_segments": []
  }
}
```

**Use cases:**
- `kill_switch.enabled: true, wipe_local_data: true` → app erases all local data on next launch and shows a hard block.
- `force_logout.enabled: true` → drops all sessions, prompts re-auth (if app has auth).
- `global_lock` → temporary maintenance for specific regions.
- `data_purge.scopes: ["analytics"]` → app drops analytics caches (e.g., for GDPR right-to-erase).

**⚠️ These flags are powerful. Test in staging first.**

---

## 12. Client processing priority

When the app refreshes data, it processes endpoints in this order. The first match wins:

```
1. emergency.kill_switch.enabled       → hard block
2. emergency.global_lock.enabled       → regional block (if region matches)
3. emergency.force_logout.enabled      → drop session
4. emergency.data_purge                → run purge
5. config.maintenance.enabled          → maintenance screen
6. blockers (scope=app, hard_block)    → app-wide block
7. config.version.min_supported_code   → mandatory update
8. blockers (scope=app, force_update)  → soft update
9. config.update.recommended           → soft prompt
10. popups (filtered by targeting)     → modal
11. announcements (filtered)           → banner
12. notifications (scheduled locally)  → reminders
13. blockers (scope=screen|feature)    → applied per-screen at runtime
14. features + rollouts                → flag evaluations
15. content + experiments              → ambient content
```

---

## 13. JSON validation

All source files are validated by the build script before encryption. Invalid JSON or missing `schema_version` fails the build (CI rejects the push).

---

*Document version: 1.0 · Last updated: 2026-04-27*
