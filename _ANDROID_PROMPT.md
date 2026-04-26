# Android AI-Agent Prompt — LifeMaster AI Integration

> **Private document.** Excluded from GitHub Pages output.
> **Purpose:** Hand the prompt below to the AI agent (Cascade / Cursor / Claude Code / Copilot Chat) operating inside the Android project. It instructs that agent to fully integrate with the new Kive Apps brand + encrypted API system, and to make coordinated updates back into the public site repo.

Copy everything between the two horizontal rules below into your Android project's AI assistant.

---

# 🎯 PROMPT BEGINS — Copy from here

You are the AI engineer for the **LifeMaster AI** Android application. A new infrastructure has been built around this app on the desktop machine. Your job is to:

1. **Fully integrate the encrypted Kive Apps API system** into this Android codebase.
2. **Replace every legacy contact / publisher / branding string** with the new Kive Apps identity.
3. **Coordinate updates back** into the companion public site repo so versions, package IDs, and contact data stay consistent.

Do not skip or skim — every section below contains decisions you must implement.

## 0. Project Locations on This Machine

You are working inside three local repositories. **Read from all three. Write to two.**

| Local path | Role | You may write? |
|------------|------|----------------|
| `C:\Smalviya\Projects\Focus\LifeMasterAI` | **THIS Android project** | ✅ YES — primary work |
| `C:\Smalviya\Projects\kive\kiveapps.github.io` | Public marketing site + encrypted API artifacts + private docs | ✅ YES — coordinated updates only |
| `C:\Smalviya\Projects\kive-sources\kiveapps-source` | Private API source (build engine + plaintext JSON) | ❌ READ ONLY (informational) |

The **first** repo is where most of your work happens. The **second** repo gets small updates after you're done (version bump, screenshots, etc.). The **third** repo is the build engine — you never edit it; you only refer to its docs.

## 1. Required Reading (do this BEFORE writing any code)

Read these files in order. They contain the protocol, threat model, schemas, and reference implementation.

```
1. C:\Smalviya\Projects\kive\kiveapps.github.io\_AI_AGENT_GUIDE.md
2. C:\Smalviya\Projects\kive\kiveapps.github.io\_DEVELOPER.md
3. C:\Smalviya\Projects\kive\kiveapps.github.io\_ARCHITECTURE.md
4. C:\Smalviya\Projects\kive\kiveapps.github.io\_API_REFERENCE.md
5. C:\Smalviya\Projects\kive\kiveapps.github.io\_ANDROID_INTEGRATION.md   ← THE primary spec for you
6. C:\Smalviya\Projects\kive\kiveapps.github.io\_BUILD.md
```

After reading, summarize back to the user (the human) in 5 bullet points what the system is, so the human can confirm you understood it before you start coding.

## 2. Brand Identity — Hard Rules

**The brand is "Kive Apps". No individual developer's name appears anywhere user-visible.**

| Field | Old value (search & replace) | New value |
|-------|------------------------------|-----------|
| Display brand | "Shubham", "Shubham Malviya", any personal name | **Kive Apps** |
| Publisher (Play Console listing helper text) | any individual name | **Kive Apps** |
| Author / `META-INF` author | any individual name | **Kive Apps** |
| Support email shown in app | (anything) | **kive.apps@gmail.com** |
| Contact email shown in app | (anything) | **kive.apps@gmail.com** |
| Feedback email | (anything) | **kive.apps@gmail.com** |
| Privacy URL | (anything) | **https://kiveapps.github.io/apps/lifemaster-ai/privacy/** |
| Support URL | (anything) | **https://kiveapps.github.io/apps/lifemaster-ai/support/** |
| Marketing site URL | (anything) | **https://kiveapps.github.io/apps/lifemaster-ai/** |
| Brand site root | (anything) | **https://kiveapps.github.io** |
| UPI ID (in any chai/donation flow) | any old UPI | **shubhammalviya786@ybl** *(internal payment endpoint only — never displayed as a person's name; payee shown as "Kive Apps")* |
| Package ID | `com.shubham.lifemasterai` | **`com.kive.lifemaster`** ⚠ see §3 if your app is already published under the old ID |
| Application label | (anything) | **LifeMaster AI** |
| App tagline | (anything) | **The Discipline OS for Focus, Recovery & Growth** |

**Where these need to change:**

- `app/build.gradle` (or `build.gradle.kts`) — `applicationId`, `versionCode`, `versionName`
- `AndroidManifest.xml` — `<application android:label="...">`
- `res/values/strings.xml` and any `values-<lang>/strings.xml`
- Splash / About / Settings screens
- In-app contact, support, feedback, privacy buttons (URL targets)
- Email intents (`Intent.ACTION_SENDTO` / `mailto:` builders)
- Any analytics tags / crash report tags
- README of this Android project (if any)
- Play Store listing fields (give the human a checklist; you can't push to Play yourself)

⚠️ **Do NOT change `applicationId` blindly** — if the app is already published, see §3 first.

## 3. Package ID Migration Decision

If `applicationId` is currently `com.shubham.lifemasterai` AND the app is already live on Google Play under that ID:

- **DO NOT** change the package ID. Google Play does not allow changing `applicationId` for a published app — doing so creates a brand-new listing and orphans every existing user.
- **DO** change every user-visible string and email and URL to Kive Apps branding.
- **DO** keep using `com.shubham.lifemasterai` everywhere internally and in Play Store URLs.
- The internal package name does not need to match the brand — Apple's apps use `com.apple.*`, but this is fine because users never see it.

If the app is **not yet published**:
- Change `applicationId` to `com.kive.lifemaster`.
- Update the corresponding folder structure under `app/src/main/java/com/kive/lifemaster/...`.
- Update the test packages similarly.

**Ask the human** which scenario applies before changing `applicationId`. Do not assume.

## 4. Encrypted API Integration

Implement the full client per `_ANDROID_INTEGRATION.md` (read it first). High-level checklist:

### 4.1 Add the `KiveApiKeys.kt` constants file

The human will run this on their machine:
```
cd C:\Smalviya\Projects\kive-sources\kiveapps-source
$env:MASTER_SECRET = "<128 hex chars>"
node tools/derive-apk-keys.js --app lifemaster-ai --vc <CURRENT_VERSION_CODE> --package <CURRENT_APPLICATION_ID>
```
This writes `tools/out/KiveApiKeys-lifemaster-ai-v<vc>.kt`.

**Tell the human** to paste that file into `app/src/main/java/<package>/kive/KiveApiKeys.kt` and **delete the local copy from `tools/out/`** afterward. The keys live only inside the signed APK.

### 4.2 Implement these classes

Create them under `app/src/main/java/<package>/kive/`:

| Class | Purpose | Spec section |
|-------|---------|--------------|
| `KapFile` | Decrypt `.bin` files (magic check + AES-GCM + AAD) | `_ANDROID_INTEGRATION.md` §2 |
| `Envelope` + `EnvelopeParser` | Parse + validate the envelope JSON (v/t/ttl/app/vc/ep/d) | §3 |
| `KiveManifestRepo` | Fetch + cache the encrypted manifest | §4 |
| `KiveEndpointRepo` | Fetch + cache individual endpoints | §5 |
| `KiveUserId` | Compute opaque user_id from install_id + android_id | §6 |
| `KiveRefreshScheduler` | Cold-boot refresh + WorkManager periodic | §7 |
| `KiveConfigStore` | Persist decrypted endpoints (use EncryptedSharedPreferences) | §8 |

### 4.3 Wire 11 endpoint consumers

Each endpoint drives a feature. Implement these consumers (mostly thin observers over `KiveConfigStore`):

| Endpoint | Drives | UI surface |
|----------|--------|------------|
| `config` | App version, maintenance mode, refresh intervals | Update prompt, maintenance screen |
| `announcements` | Banners, cards, fullscreens (timed/permanent) | Top banners, in-screen cards |
| `notifications` | Local scheduled notifications | NotificationManager + AlarmManager |
| `popups` | Dialogs, ratings, surveys, changelogs | DialogFragment / Composable bottom sheet |
| `blockers` | App/screen/feature/region/time blocks | Routed at navigation guard layer |
| `features` | Feature flags + rollout percentages | A `FeatureFlags` singleton |
| `premium` | Subscription tiers, per-user grants, trials | Entitlement check before locked features |
| `segments` | User segmentation | Used by other endpoints' targeting |
| `experiments` | A/B test variants | A `Experiments` singleton with sticky assignment |
| `content` | Daily quotes, coaching tips, challenges | Home feed, tip cards |
| `emergency` | Kill switch, force logout, global lock, data purge | Application-level guard, runs first |

**Processing priority (CRITICAL):** Process endpoints in the order listed in `_API_REFERENCE.md` §12. The `emergency` endpoint MUST be checked before anything else on every refresh.

### 4.4 Refresh strategy

- Cold boot → fetch `emergency` first; if `kill_switch.enabled`, render the block and stop.
- Otherwise fetch `config`, `blockers`, `features`, `premium`, `segments` in parallel.
- Lazy-fetch `announcements`, `popups`, `notifications`, `experiments`, `content` (lower priority).
- `WorkManager` periodic worker every 180 minutes (configurable via `config.refresh.endpoints_interval_minutes`).
- Critical endpoints (`emergency`, `blockers`, `config`) refresh every 15 minutes when app is foreground.

### 4.5 Caching & Offline-First

- Persist every decrypted payload to `EncryptedSharedPreferences` (not raw `SharedPreferences`).
- On network failure, always fall back to cache.
- Hardcode safe defaults in code so the app works on first launch before any network response.
- Track per-endpoint highest-seen `t` (timestamp) and reject any response with an older `t` (replay defense beyond TTL).

### 4.6 Error Handling

| Exception | Action |
|-----------|--------|
| `bad magic` (server returned HTML 404) | Use cache; retry next cycle |
| `unsupported version` (server bumped format) | Surface a "please update" prompt |
| `AEADBadTagException` (tampered or wrong key) | Use cache; do NOT crash; log to crash reporter |
| `manifest stale` | Retry once; otherwise use cache |
| `Endpoint not in manifest` | Use cache; alert via crash reporter |

**Never crash the app on remote-config failure.** Cache-and-continue is the default.

## 5. Backward Compatibility

If the app currently has any HTTP client pointed at:
- `https://kiveapps.github.io/api/v1/...` (the old plaintext API — now removed)
- Any other plaintext config endpoint
- Firebase Remote Config (if used)

→ **Remove those entirely.** They are obsolete. Replace with calls into the encrypted API client.

If a user is on a very old version that still hits the old plaintext API, they'll get 404s and fall back to bundled defaults. That's the intended behavior — they'll see the "please update" prompt the next time they hit the new API via a fresh APK install.

## 6. Strings & Resources Audit

Run a global find-replace across `res/` for these patterns. List every change in your reply to the human before applying.

```
"Shubham"            → "Kive Apps"           (case-insensitive search)
"Malviya"            → ""                    (delete)
"Made by"            → "By Kive Apps"
"Developed by"       → "By Kive Apps"
"Author:"            → "Publisher:"
the developer        → the team
the dev              → the team
his app              → our app
my app               → our app
```

For email addresses, replace any `@gmail.com` / `@outlook.com` / etc. references with `kive.apps@gmail.com` (after confirming with the human that you've found the right ones).

## 7. Update These Resource Files

| File | Change |
|------|--------|
| `app/src/main/res/values/strings.xml` | `app_name`, `support_email`, `contact_email`, `privacy_url`, `support_url`, `marketing_url` |
| `app/src/main/res/raw/privacy_policy.html` (if present) | Sync content from `https://kiveapps.github.io/apps/lifemaster-ai/privacy/` |
| `app/src/main/res/xml/data_extraction_rules.xml` (if present) | No changes needed (offline-first) |
| `app/src/main/res/values/strings_about.xml` (or wherever About is) | Update copyright to "© 2026 Kive Apps. All rights reserved." |
| `fastlane/metadata/android/en-US/full_description.txt` (if you use Fastlane for Play Store metadata) | Sync to the new copy on the marketing site |

## 8. Coordination Updates Back to Public Repo

After your Android changes are committed and the new APK is signed, edit these files in `C:\Smalviya\Projects\kive\kiveapps.github.io`:

### 8.1 Bump version display

Open `apps\lifemaster-ai\index.html` and update any visible "Version 1.0.0" or release-date text to match the new APK.

### 8.2 Screenshots

If you generated new screenshots for Play Store, add the best 2–3 to `apps\lifemaster-ai\screenshots\` and reference them on the page (you'll need to add a screenshot gallery section if one doesn't exist).

### 8.3 Changelog

If you maintain a changelog, append the new version under a "What's New" section on `apps\lifemaster-ai\index.html` (above the FAQ section is a good spot).

### 8.4 Sitemap timestamp

Open `sitemap.xml` and add `<lastmod>YYYY-MM-DD</lastmod>` to the LifeMaster AI URL entry.

### 8.5 Commit message

Use a single coordinated commit on the public repo:
```
chore(lifemaster-ai): sync site to APK v<X.Y.Z>

- Bumped displayed version to <X.Y.Z>
- Updated screenshots
- Added changelog entry for <X.Y.Z>
```

### 8.6 Source repo coordination (the human runs this — you don't)

If the new APK changes the `versionCode`, the human must also:
1. Bump `_meta/versions.json` in `kiveapps-source` to add the new version_code.
2. Copy `_source/lifemaster-ai/v1_0_0/` to `_source/lifemaster-ai/v<new>/` and edit `config.json` to reflect the new version.
3. Push `kiveapps-source` to trigger a CI build that produces encrypted artifacts for the new version.
4. Run `node tools/derive-apk-keys.js` to get the new Kotlin keys file.
5. Paste keys into Android project, rebuild APK, ship to Play Store.

**Tell the human these steps explicitly** in your final summary so they don't forget.

## 9. Privacy Promises (visible to users)

The marketing site promises:
- 100% offline-capable
- Zero data collection
- Zero ads
- Zero trackers
- Free forever

Your code must honor these. Specifically:
- **No analytics SDKs** that send personally identifiable data (Firebase Analytics, Mixpanel, Amplitude, etc.).
- **No crash reporters** that include user identifiers in payloads. *(Crashlytics with `setCrashlyticsCollectionEnabled(false)` until user opts in is acceptable; default-off only.)*
- **No advertising IDs** read.
- **No location** unless a feature explicitly requires it AND the user enabled it.
- **No contacts, photos, microphone** unless a feature requires it.
- **All app data** stays on-device unless the user explicitly exports it.

If existing code violates these, either remove the SDK or make it strictly opt-in with a clear explanation in the privacy policy. **Default state is OFF.**

## 10. Anti-Tamper / Anti-Reverse-Engineering Hardening (recommended)

For the new APK, enable:
- **R8 minification** with aggressive shrink (already in release builds typically)
- **Code obfuscation** including the `kive` package
- **String encryption** for any sensitive constants (`net.zetetic.android-database-sqlcipher` patterns work; many open libs exist)
- **Root detection** (optional): show a soft warning, don't hard-block — bricking rooted users is hostile
- **Debuggable false** in release builds (default)
- **`networkSecurityConfig`** restricting cleartext traffic and limiting trust to system + your CDN

These are not strict requirements — they're defense in depth. Discuss with the human before implementing complex ones.

## 11. Testing Checklist (run before declaring done)

- [ ] Round-trip decryption test — encrypt a known payload locally with `MASTER_SECRET`, decrypt with `KapFile`, verify match.
- [ ] AAD test — try decrypting `popups.bin` with the `config` key + `config` AAD; expect failure.
- [ ] TTL test — feed a payload with `t = 0`; expect rejection with `manifest stale` / `endpoint stale`.
- [ ] Replay test — feed a payload with `t` older than the cached `t`; expect rejection.
- [ ] Cache fallback — disable network; app continues to work using cached values.
- [ ] Cold boot — first launch with no network: app shows bundled defaults, no crash.
- [ ] Force update — set `version.min_supported_code > VERSION_CODE` in `config`; expect mandatory update screen.
- [ ] Kill switch — set `emergency.kill_switch.enabled: true`; expect hard block on next refresh.
- [ ] Premium grant — add user's hash prefix to `premium.user_grants`; expect locked feature unlocks.
- [ ] Feature flag rollout — set rollout percentage; verify stable assignment based on install_id.
- [ ] WorkManager fires periodically — observable in `adb shell dumpsys jobscheduler`.

## 12. Final Summary You Must Deliver to the Human

When you finish, give the human a single message containing:

1. **What you read** (file paths)
2. **What you changed in the Android project** (list of files + one-line summary each)
3. **What you changed in `kiveapps.github.io`** (list of files + one-line summary each)
4. **What the human still needs to do**:
   - Generate `KiveApiKeys.kt` via `derive-apk-keys.js`
   - Paste it into the Android project
   - Build & sign release APK
   - Update `kiveapps-source` if version_code changed (with exact commands)
   - Push everything
   - Verify privacy on the deployed site (give them the curl commands from `_BUILD.md` §7)
5. **Open questions** — anything you couldn't decide and need human input on

## 13. Hard Don'ts (if you do these you've failed)

- ❌ Hardcoding the master secret anywhere in the Android code (only the *derived* per-version keys belong in the APK)
- ❌ Making any HTTP request to a plaintext API endpoint
- ❌ Leaving the developer's name visible in any user-facing string
- ❌ Crashing the app on a remote-config failure
- ❌ Logging decrypted payloads to disk in plaintext
- ❌ Adding analytics or trackers without explicit opt-in
- ❌ Pushing the generated `KiveApiKeys.kt` to a public commit before deletion
- ❌ Editing files under `kive-sources` (READ ONLY for you)
- ❌ Editing the auto-generated `/d/`, `/m/`, `/decoys/` artifacts in the public repo
- ❌ Changing `applicationId` if the app is already published

## 14. Quick Reference — Branding Constants

Centralize these in `strings.xml` so future updates are one-place:

```xml
<resources>
    <string name="app_name">LifeMaster AI</string>
    <string name="brand_name">Kive Apps</string>
    <string name="brand_url">https://kiveapps.github.io</string>
    <string name="app_marketing_url">https://kiveapps.github.io/apps/lifemaster-ai/</string>
    <string name="app_privacy_url">https://kiveapps.github.io/apps/lifemaster-ai/privacy/</string>
    <string name="app_support_url">https://kiveapps.github.io/apps/lifemaster-ai/support/</string>
    <string name="contact_email">kive.apps@gmail.com</string>
    <string name="support_email">kive.apps@gmail.com</string>
    <string name="feedback_email">kive.apps@gmail.com</string>
    <string name="copyright_notice">© 2026 Kive Apps. All rights reserved.</string>
    <string name="play_store_url">https://play.google.com/store/apps/details?id=com.kive.lifemaster</string>
</resources>
```

(Substitute `com.kive.lifemaster` with the actual `applicationId` if §3 said to keep the old one.)

Reference these from code via `getString(R.string.brand_name)`, never hardcoded literals.

## 15. Begin

**Acknowledge** that you've read this prompt by replying with the 5-bullet summary requested in §1. Then ask the human one clarifying question per topic if anything is unclear (especially §3 about `applicationId`). Do not start writing code until the human confirms.

# 🎯 PROMPT ENDS — Copy until here

---

## Notes for the Human (don't paste these into the Android agent)

- After the Android agent completes its work, return to **this** repo and verify privacy: run the curl checks from `_BUILD.md` §7.
- If the Android agent asks you to choose between keeping vs changing `applicationId` (§3), the safe answer for an already-published app is **keep the existing ID**.
- The agent will need the `MASTER_SECRET` only to run `derive-apk-keys.js`. **You** run that command in `kiveapps-source`, then hand the agent the resulting `.kt` file. The agent itself never sees the master secret.
- After the agent has updated the Android app, push the Android repo, then run the coordination commits the agent suggested for `kiveapps.github.io` and (if needed) `kiveapps-source`.

---

*Document version: 1.0 · Last updated: 2026-04-27*
