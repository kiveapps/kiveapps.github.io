# Kive Apps — Build & Operations Guide

> **Private document.** Excluded from GitHub Pages output.

This document covers daily operations: how the build pipeline works, how to push changes, how to add a new app, and how to handle incidents.

---

## 1. Architecture Recap

```
┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
│  kiveapps-source  (PRIVATE repo)    │         │  kiveapps.github.io  (PUBLIC repo)  │
│                                     │         │                                     │
│  _source/                           │         │  d/<hash>/<hash>.bin   (encrypted)  │
│   └── lifemaster-ai/                │         │  m/<hash>.bin          (manifest)   │
│        └── v1_0_0/                  │   CI    │  decoys/<hash>.bin     (fakes)      │
│             ├── config.json         │  push   │                                     │
│             ├── announcements.json  ├────────►│  index.html, /apps/, /blog/, etc.   │
│             └── ... (9 more)        │         │  (public marketing pages)           │
│                                     │         │                                     │
│  build.js                           │         │  _DEVELOPER.md, _ARCHITECTURE.md,   │
│  .github/workflows/...              │         │  ... (Jekyll-excluded private docs) │
│                                     │         │                                     │
│  Secrets:                           │         │                                     │
│   • MASTER_SECRET (the root key)    │         │  Served at: kiveapps.github.io      │
│   • DEPLOY_PAT (write access)       │         │                                     │
└─────────────────────────────────────┘         └─────────────────────────────────────┘
```

**Two repos, one secret:** the master key lives only in GitHub Secrets on the private repo. The public repo never sees plaintext.

---

## 2. Daily Operations

### Update an existing endpoint (e.g., add an announcement)

```bash
cd C:\Smalviya\Projects\kive-sources\kiveapps-source
# Edit the file
notepad _source/lifemaster-ai/v1_0_0/announcements.json
git add -A
git commit -m "feat(announcements): diwali banner"
git push
```

CI runs in ~15s, deploys in ~30s total. The Android app's next refresh picks it up.

### Toggle a feature flag

```bash
# Edit features.json — set "enable_voice_coach": false
git commit -am "chore(features): disable voice coach pending fix"
git push
```

### Push an emergency kill switch

```bash
# Edit emergency.json:
# "kill_switch": { "enabled": true, "title": "Service Paused", "message": "..." }
git commit -am "ops: kill switch ON"
git push
```

Within ~30s, every active install hits the maintenance/kill screen on next refresh (or on next cold start, whichever comes first). **Critical refresh interval defaults to 15 minutes** (configurable in `config.json`).

### Disable the kill switch

```bash
# Set enabled back to false
git commit -am "ops: kill switch OFF"
git push
```

---

## 3. Adding a New App

```bash
cd C:\Smalviya\Projects\kive-sources\kiveapps-source

# 1. Add the app to versions.json
notepad _source/_meta/versions.json
# (add a new entry under "apps[]")

# 2. Create the source folder by copying an existing one
xcopy /E /I _source\lifemaster-ai\v1_0_0 _source\<new-slug>\v1_0_0

# 3. Edit each JSON file and replace lifemaster-ai with the new slug,
#    update package_id, names, etc.

git add -A
git commit -m "feat: add <new-app-name> v1.0.0"
git push
```

CI will build encrypted endpoints for both apps in the same run.

On the public repo side, **also** add HTML pages under `/apps/<new-slug>/` (this is for the marketing site, separate from the encrypted API). See `apps/lifemaster-ai/` as the template.

---

## 4. Adding a New Version of an Existing App

Per `_ARCHITECTURE.md` §11, version rotation is the right way to rotate keys.

```bash
cd C:\Smalviya\Projects\kive-sources\kiveapps-source

# 1. Add a new versions[] entry in _meta/versions.json
#    (e.g., version_code: 2, version_name: "1.1.0")

# 2. Copy v1_0_0 → v1_1_0 as the starting point
xcopy /E /I _source\lifemaster-ai\v1_0_0 _source\lifemaster-ai\v1_1_0

# 3. Edit endpoints to reflect new version's data

# 4. Bump version.latest_code in v1_0_0/config.json (so v1 users see the update prompt)
#    but DON'T raise min_supported_code yet — wait until rollout is high.

git add -A
git commit -m "feat: lifemaster-ai v1.1.0 source"
git push
```

After CI completes, run the (offline) key-derivation tool to generate `KiveApiKeys.kt` for v1.1.0:

```powershell
$env:MASTER_SECRET = "<128 hex chars>"
node tools/derive-apk-keys.js --app lifemaster-ai --vc 2 --package com.kive.lifemaster
# Output: tools/out/KiveApiKeys-lifemaster-ai-v2.kt
```

Paste the file into the Android project, build the APK, ship to Play Store, then delete the local copy of the .kt file.

When v1.1.0 has high adoption, bump `min_supported_code` in v1_0_0's config to force-update remaining v1.0.0 users.

---

## 5. Manual CI Trigger

```
GitHub UI → kiveapps-source → Actions → "Build & Deploy Encrypted APIs" → Run workflow
```

Useful for:
- Forcing a fresh build with rotated paths (no source changes needed; the build nonce changes anyway).
- Re-deploying after fixing the public repo manually.

---

## 6. CI Output Verification

After a workflow run completes, the GitHub Actions "Build summary" tab shows:

```
## Deployment Summary
- **Build nonce**: 7f3a9b2c1e4d8a7b
- **Built at**: 2026-04-27T18:42:11.000Z
- **Apps deployed**: lifemaster-ai

Encrypted artifacts pushed to kiveapps/kiveapps.github.io.
```

The same nonce is in the auto-commit message on the public repo:
```
chore: rebuild encrypted API artifacts

Build nonce: 7f3a9b2c1e4d8a7b
Triggered by: push
Source SHA: <40-char-sha>
[skip ci]
```

---

## 7. Privacy Verification

After every public repo deploy (manual or CI), spot-check:

```bash
# Should return 404
curl -I https://kiveapps.github.io/_DEVELOPER.md
curl -I https://kiveapps.github.io/_ARCHITECTURE.md
curl -I https://kiveapps.github.io/_API_REFERENCE.md
curl -I https://kiveapps.github.io/_ANDROID_INTEGRATION.md
curl -I https://kiveapps.github.io/_BUILD.md
curl -I https://kiveapps.github.io/_AI_AGENT_GUIDE.md
curl -I https://kiveapps.github.io/_config.yml
curl -I https://kiveapps.github.io/README.md

# Should return 200
curl -I https://kiveapps.github.io/
curl -I https://kiveapps.github.io/robots.txt
curl -I https://kiveapps.github.io/ai.txt
curl -I https://kiveapps.github.io/sitemap.xml

# Should return 404 (no autoindex)
curl https://kiveapps.github.io/d/
curl https://kiveapps.github.io/m/
curl https://kiveapps.github.io/decoys/
```

**If any private file returns 200**, immediately:
1. Push a no-op commit to the public repo to retrigger Pages build.
2. Confirm `_config.yml` has the file in its `exclude:` list.
3. If still served, a Jekyll cache may be stuck — wait 10 minutes.

---

## 8. Incident Response

### Wrong data deployed to production
1. Edit the source JSON in `kiveapps-source` to revert.
2. Push. CI redeploys in ~30s.
3. Apps with cached old-old data won't hit the bad-new data because cache TTL applies; users on critical endpoints (TTL 15m) recover within 15 minutes.

### Master secret suspected leaked
See `_ARCHITECTURE.md` §11. Bump `version_code`, regenerate APK, force-update.

### Public repo accidentally received plaintext source
1. **Don't** just `git rm` — that doesn't remove from history.
2. Use `git filter-repo` or BFG to scrub the file from all history.
3. Force-push.
4. **Rotate `MASTER_SECRET`** if any secret material was exposed.
5. Issue an incident note in `_DEVELOPER.md` with the date and remediation.

### Kill switch refuses to activate
1. Check the workflow ran successfully.
2. Check the auto-commit landed on the public repo.
3. Check the app's network connectivity.
4. Check the app's "critical refresh interval" — by default 15 min. Cold-restart the app to force immediate refresh.
5. Inspect device logs for `AEADBadTagException` (key mismatch — likely a build problem).

---

## 9. Adding a New Endpoint Type

If you ever need a 12th, 13th, etc. endpoint:

1. Decide a name (e.g., `quotas`).
2. Add it to the `endpoints` array in `_meta/versions.json` for every active version.
3. Create `_source/<app>/v<ver>/quotas.json` with `schema_version: 1` and your data.
4. Document the schema in `_API_REFERENCE.md`.
5. Push. CI rebuilds the manifest with the new endpoint.
6. Update the Android client to consume the new endpoint (you'll also need to derive its content key — the offline tool emits one per endpoint listed in `versions.json`).

---

## 10. Local Sanity Build (optional)

If you want to test a build without pushing:

```bash
cd C:\Smalviya\Projects\kive-sources\kiveapps-source
# Set the master secret in your terminal session (DO NOT save to file)
$env:MASTER_SECRET = "<128 hex chars>"
node build.js
# Output appears under dist/
ls dist/
```

The `dist/` folder is `.gitignore`d. **Never commit it.** Always let CI produce the official artifacts.

---

*Document version: 1.0 · Last updated: 2026-04-27*
