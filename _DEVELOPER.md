# Kive Apps — Developer Documentation

> **Private.** Excluded from GitHub Pages output via `_config.yml`.
> This is your master index. Start here.

---

## What is this project?

Kive Apps is a brand that builds free, private, offline-first Android apps. The infrastructure has two parts:

1. **Public marketing site** (`kiveapps.github.io`) — cinematic showroom for the brand and individual apps.
2. **Encrypted silent-features API** — a static, GitHub-hosted backend that lets us push remote announcements, popups, banners, blockers, premium grants, feature flags, kill switches, and more — without releasing a new APK. Every request and response is AES-256-GCM encrypted with version-specific keys, and paths are HMAC-derived to look like opaque CDN assets.

Two repositories support this:

| Repo | Visibility | Purpose |
|------|------------|---------|
| `kiveapps/kiveapps-source` | **PRIVATE** | Plaintext source data + build engine + GitHub Actions workflow |
| `kiveapps/kiveapps.github.io` | **PUBLIC** | Marketing site + encrypted CI artifacts + private docs (Jekyll-excluded) |

The master secret never leaves the private repo's GitHub Secrets. The public repo never sees plaintext.

---

## Document Index

Read these in order if you're new. Skip to the relevant one if you're not.

| Document | What's in it |
|----------|--------------|
| **[_AI_AGENT_GUIDE.md](_AI_AGENT_GUIDE.md)** | Operating instructions for AI assistants on this codebase |
| **[_ARCHITECTURE.md](_ARCHITECTURE.md)** | Threat model, cryptography, key hierarchy, file format, manifest protocol |
| **[_API_REFERENCE.md](_API_REFERENCE.md)** | Schemas for all 11 endpoints (config, announcements, popups, blockers, premium, etc.) |
| **[_ANDROID_INTEGRATION.md](_ANDROID_INTEGRATION.md)** | Kotlin code: file decoder, envelope parser, manifest fetcher, refresh scheduler |
| **[_BUILD.md](_BUILD.md)** | Daily ops: pushing changes, adding apps/versions, incident response |
| **`kiveapps-source/SETUP.md`** | One-time setup of secrets, PAT, GitHub Actions |
| **[README.md](README.md)** | Public repo overview (also private; not served by Pages) |

---

## Current Apps

| App | Slug | Package ID | Latest version | Status |
|-----|------|------------|----------------|--------|
| LifeMaster AI | `lifemaster-ai` | `com.kive.lifemaster` | 1.0.0 (code 1) | Active |

To add a new app: see `_BUILD.md` §3.

---

## Endpoint Catalog (per app, per version)

11 endpoints + 1 manifest. All encrypted, all per-version-keyed.

| Endpoint | Drives | Critical? |
|----------|--------|-----------|
| `config` | App version, maintenance mode, refresh intervals, links | ✅ |
| `announcements` | Banners, cards, fullscreens (timed/permanent, skippable/non-skippable) | |
| `notifications` | Scheduled in-app notifications | |
| `popups` | Dialogs, ratings, surveys, changelogs | |
| `blockers` | App-level / screen-level / feature-level / regional / time-based blocks | ✅ |
| `features` | Feature flags + rollout percentages + custom config | |
| `premium` | Subscription tiers, per-user grants, trials | |
| `segments` | User segmentation rules | |
| `experiments` | A/B test definitions and variant assignments | |
| `content` | Daily quotes, coaching tips, challenges (refreshable without app update) | |
| `emergency` | Kill switch, force logout, global lock, data purge | ✅ |
| `_manifest` | (auto-generated) encrypted index of current paths | ✅ |

Critical endpoints refresh every 15 minutes by default. Others every 3 hours.

---

## Site Structure (public marketing pages)

```
/                              → Home (cinematic brand showroom)
/apps/lifemaster-ai/           → Product page
/apps/lifemaster-ai/privacy/   → Privacy policy
/apps/lifemaster-ai/support/   → Buy us a chai
/blog/                         → Blog index
/community/                    → Community hub
/contact/                      → Contact form
/404.html                      → Custom 404
/robots.txt                    → Crawler rules + AI bot blocks
/ai.txt                        → AI training opt-out
/sitemap.xml                   → Public-only entries
```

All public pages must include:

```html
<meta name="robots" content="index,follow,noai,noimageai">
<meta name="googlebot" content="index,follow,noai,noimageai">
```

All public pages must use the brand name **Kive Apps** — no individual developer attribution.

---

## Email Routing (abstracted from users)

Users always see `kive.apps@gmail.com`. Internally, Gmail's `+` aliasing routes to:

| Purpose | Public-facing | Real recipient |
|---------|---------------|----------------|
| Support | kive.apps@gmail.com | kive.apps+support@gmail.com |
| Contact form | kive.apps@gmail.com | kive.apps+contactus@gmail.com |

Gmail filters auto-label these into `Kive/Support` and `Kive/ContactUs`.

---

## Privacy Verification (run after every public-repo deploy)

```bash
# These MUST return 404
curl -I https://kiveapps.github.io/_DEVELOPER.md
curl -I https://kiveapps.github.io/_ARCHITECTURE.md
curl -I https://kiveapps.github.io/_API_REFERENCE.md
curl -I https://kiveapps.github.io/_ANDROID_INTEGRATION.md
curl -I https://kiveapps.github.io/_BUILD.md
curl -I https://kiveapps.github.io/_AI_AGENT_GUIDE.md
curl -I https://kiveapps.github.io/_config.yml
curl -I https://kiveapps.github.io/README.md

# These MUST return 200
curl -I https://kiveapps.github.io/
curl -I https://kiveapps.github.io/robots.txt
curl -I https://kiveapps.github.io/ai.txt
curl -I https://kiveapps.github.io/sitemap.xml
```

If any private file returns 200, see `_BUILD.md` §7.

---

## Hard Rules

1. Never expose the master secret in any commit, screenshot, or chat log.
2. Never make `kiveapps-source` public.
3. Never publish files starting with `_` from this repo to GitHub Pages output.
4. Never add a plaintext API URL — everything goes through encrypted endpoints.
5. Never reference an individual developer's name in public content.
6. Never weaken or shortcut the cryptographic protocol.

---

*Document version: 2.0 (post-encryption rewrite) · Last updated: 2026-04-27*
