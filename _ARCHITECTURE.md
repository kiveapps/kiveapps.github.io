# Kive Apps — Security Architecture

> **Private. Excluded from GitHub Pages output via `_config.yml`.**
> If this URL ever returns content publicly, the privacy fix has regressed.

This document specifies the threat model, cryptographic primitives, and protocol used for all communication between Kive Apps Android applications and the kiveapps.github.io static-content backend.

---

## 1. Threat Model

### Adversary capabilities (assumed)
1. **Network observer** — TLS prevents body inspection, but URLs are visible to the host (GitHub Pages CDN). The adversary can enumerate any path that exists.
2. **Site scraper** — Can issue arbitrary GET requests, follow links, brute-force common paths, run AI-assisted content extraction.
3. **APK reverse-engineer** — Can decompile a published APK, extract hardcoded secrets, replay any embedded request.
4. **Replay attacker** — Captures a valid response and tries to serve it to other users (via DNS hijack, intercepting proxy, etc.).
5. **Mass download** — Downloads every file under the GitHub Pages site and tries to identify endpoints by content patterns.
6. **AI training crawler** — Indexes content for inclusion in LLM training data.

### What we protect
1. **Confidentiality** — payload contents are unintelligible without an app version's key.
2. **Integrity** — modified payloads fail authentication (GCM auth tag).
3. **Authenticity** — only artifacts produced by the official build pipeline decrypt cleanly.
4. **Freshness** — stale or replayed responses are rejected via embedded TTL.
5. **Anti-enumeration** — paths are derived from secrets, not predictable from app identity.
6. **Anti-correlation** — file names rotate every build, so old paths don't reveal new state.
7. **Anti-AI** — meta directives + robots.txt + content encryption defeat training crawlers.

### What we explicitly do NOT protect against
- An attacker who decompiles the APK **of the same version they're attacking** can read that version's payloads. That is fundamental — any client must hold its own keys. We mitigate by per-version key rotation.
- Sophisticated **side-channel** attacks (timing analysis on the static CDN) — not relevant for a static file host.

---

## 2. Cryptographic Primitives

| Purpose | Primitive | Parameters |
|---------|-----------|------------|
| Master secret | random 64 bytes (512 bits) | `crypto.randomBytes(64)` |
| Key derivation | HKDF-SHA256 | output 32 bytes per purpose |
| Content encryption | AES-256-GCM | 96-bit IV, 128-bit auth tag |
| Path hashing | HMAC-SHA256 | truncated to 16 hex chars (64 bits) |
| User-id hashing | HMAC-SHA256 | full 32-byte output |
| Outer integrity (optional) | HMAC-SHA256 over ciphertext | for non-GCM legacy clients |

All implemented via Node.js built-in `crypto`. No external dependencies.

---

## 3. Key Hierarchy

```
MASTER_SECRET (64 bytes, GitHub Secret)
   │
   ├── HKDF(salt = "<app>|<vc>|content", info = "<endpoint>|content|v1") → CONTENT_KEY [32 B]
   ├── HKDF(salt = "<app>|<vc>|path",    info = "<endpoint>|path|v1")    → PATH_KEY    [32 B]
   ├── HKDF(salt = "<app>|<vc>|hmac",    info = "<endpoint>|hmac|v1")    → HMAC_KEY    [32 B]
   └── HKDF(salt = "<app>|<vc>|manifest",info = "_manifest|manifest|v1") → MANIFEST_KEY [32 B]
```

**Properties:**
- Different `<app>` → different keys (cross-app isolation).
- Different `<version_code>` → different keys (per-version rotation; compromising one APK doesn't expose others).
- Different `<endpoint>` → different keys (compromising one endpoint's plaintext doesn't help with others).
- Different `<purpose>` → different keys (key separation; signing keys ≠ encryption keys).

---

## 4. Path Derivation

Paths look like opaque CDN assets:

```
/d/<endpoint-dir-hash>/<data-file-hash>.bin
   ↓                      ↓
   16 hex chars            16 hex chars (rotates every build)
```

```
endpoint-dir-hash = HMAC(PATH_KEY, "<app>|<vc>|<endpoint>|dir")[0..16]
data-file-hash    = HMAC(PATH_KEY, "<app>|<vc>|<endpoint>|file|<build_nonce>")[0..16]
```

**Why two-level?**
- `endpoint-dir-hash` is **stable** for a given `(app, version, endpoint)` — apps can cache this directory locally and not re-derive it.
- `data-file-hash` **rotates every build** — apps must fetch the manifest to learn the current file name. This kills attackers who memorize old paths.

**Why truncate to 16 hex chars?**
- 64 bits of search space ≫ unfeasible to brute force for a static file host.
- Short enough to look like a normal CDN asset.

---

## 5. File Format

```
Offset   Length  Field
─────────────────────────────────────────────
0..3     4       Magic: "KAP\0" (0x4B 0x41 0x50 0x00)
4        1       Format version: 0x01
5..16    12      AES-GCM IV (96-bit nonce)
17..32   16      AES-GCM authentication tag (128-bit)
33..end  N       Ciphertext
```

**AAD (Additional Authenticated Data):** `"<app>|<vc>|<endpoint>"` (UTF-8 bytes).

This binds the ciphertext to its endpoint context. Swapping a `popups.bin` into the `config.bin` slot fails authentication.

---

## 6. Plaintext Envelope

After decryption, the plaintext is a JSON object:

```json
{
  "v": 1,
  "t": 1714162800000,
  "ttl": 86400,
  "app": "lifemaster-ai",
  "vc": 1,
  "ep": "config",
  "d": { /* actual endpoint payload */ }
}
```

**Field meanings:**
- `v` — envelope schema version (must be 1).
- `t` — Unix epoch milliseconds when this was built (replay defense).
- `ttl` — seconds; client rejects if `now - t > ttl * 1000`.
- `app`, `vc`, `ep` — must match the AAD; double-check by client.
- `d` — actual endpoint data.

**Replay defense:**
The client maintains a per-endpoint "highest-seen `t`" counter and refuses any response with a `t` older than the last successfully-fetched one. This prevents an attacker from serving an older (but still-fresh-by-TTL) response.

---

## 7. Manifest Protocol

Apps don't know the data-file-hash because it rotates every build. They learn it from the manifest:

```
1. App boots / cache miss / refresh interval expired
2. App computes: manifest_path = HMAC(MANIFEST_KEY, "<app>|<vc>|manifest")[0..20]
3. App GETs https://kiveapps.github.io/m/<manifest_path>.bin
4. App decrypts using MANIFEST_KEY
5. Manifest contains: { endpoints: { config: "/d/abcd.../1234.bin", ... } }
6. App fetches each endpoint as needed using paths from the manifest
7. Each endpoint payload uses its own CONTENT_KEY (not the manifest key)
```

**Manifest TTL:** 1 hour (configurable). Forces regular re-fetch so path rotation propagates.

---

## 8. Per-User Premium (Server-less Entitlements)

GitHub Pages can't run server logic, so per-user features are achieved via:

```
1. App generates user_id = HMAC(USER_HASH_KEY, install_id || android_id)
2. user_id is a 256-bit opaque hash; nobody can reverse it to find the device
3. premium.json contains: { "user_grants": { "<hex-prefix>": <encrypted-entitlements> } }
4. App computes its own user_id, looks up the prefix, decrypts the entitlements
```

**Adding a premium user:**
- Compute their user_id from their install_id + android_id (collected via support form, ticket, or lifetime purchase).
- Add to `_source/<app>/v<ver>/premium.json` under `user_grants`.
- Push → CI rebuilds → user's app picks up entitlement on next refresh.

**Removing a premium user:** Delete their entry from `user_grants`. After their cache expires (default 1 hour for premium), feature lock returns.

---

## 9. Decoy Files

The build pipeline emits 12 random `.bin` files under `/decoys/` that:
- Have the same magic header as real files.
- Have plausible random-looking IVs and tags.
- Decrypt to garbage (no key derives them).

A scraper that downloads all `.bin` files and tries to identify "real" vs "fake" by structural analysis cannot distinguish them. Only the app, with the right keys, knows which paths matter — it gets them from the manifest.

---

## 10. Anti-Scraping Layers

| Layer | What it does | Bypass cost |
|-------|--------------|-------------|
| `robots.txt` | Tells compliant bots to leave | Trivially ignored |
| `ai.txt` | Declares no-AI-training intent | Trivially ignored |
| `<meta name="robots" content="noai,noimageai">` | Same | Trivially ignored |
| Excluded paths in sitemap | Search engines won't surface | Doesn't stop direct access |
| **Path obfuscation** | No way to enumerate `/d/` | High — must brute force 64-bit hash |
| **Content encryption** | Files are unreadable garbage | Infeasible without master |
| **Path rotation** | Bookmarked paths break next build | Forces re-discovery every build |
| **Decoy files** | False positives on structural analysis | Wastes attacker time |
| **Jekyll exclusion** | Private docs return 404 | Only matters if `_config.yml` is correct |

---

## 11. Disaster Recovery

### If `MASTER_SECRET` leaks
1. Generate a new master secret.
2. Bump every app's `version_code` in `_meta/versions.json` (e.g., 1 → 2).
3. Build new APKs that hardcode the new version code.
4. Update `MASTER_SECRET` in GitHub Secrets.
5. Push to trigger rebuild.
6. Force-update everyone via `config.json` `update.mandatory: true`.
7. **Old APKs are now bricks** — they can't decrypt new responses.

### If `MASTER_SECRET` is lost
Same as above, but **everyone is stuck on cached data**. There's no way to recover old encryption without the original master. This is why the user keeps a backup of the master secret in their password manager.

### If a single endpoint key leaks
The threat is limited to that `(app, version, endpoint)` triple. Bump the version code (see leak procedure) or, if the leaked content is harmless (e.g., a marketing announcement), do nothing.

---

## 12. Verification Checklist

Run after every meaningful deploy:

- [ ] `curl -I https://kiveapps.github.io/_DEVELOPER.md` → **404**
- [ ] `curl -I https://kiveapps.github.io/_ARCHITECTURE.md` → **404**
- [ ] `curl -I https://kiveapps.github.io/_config.yml` → **404**
- [ ] `curl https://kiveapps.github.io/d/` → **404** (no autoindex)
- [ ] `curl https://kiveapps.github.io/robots.txt` → 200, includes AI bot blocks
- [ ] `curl https://kiveapps.github.io/ai.txt` → 200
- [ ] Encrypted file randomly sampled → first 4 bytes are `4B 41 50 00`
- [ ] Pasting an encrypted `.bin` into `https://www.virustotal.com/gui/home/search` → no plaintext detected

---

## 13. Cryptographic Test Vectors

For implementers verifying their decryption logic matches the build pipeline:

```javascript
// Inputs
master      = "00".repeat(64) // 64 bytes of 0x00, hex-encoded
app         = "test-app"
version     = 1
endpoint    = "config"
plaintext_d = { "hello": "world" }
fixed_iv    = Buffer.alloc(12, 0x42) // for test reproducibility only
fixed_t     = 0
```

The Node.js test in `build.js`'s `selfTest()` function performs an encrypt → decrypt round-trip on every CI run, ensuring the protocol is implemented consistently.

---

## 14. Implementation References

- **Build engine** — `kiveapps-source/build.js`
- **Setup procedure** — `kiveapps-source/SETUP.md`
- **Android decryption sample** — `_ANDROID_INTEGRATION.md`
- **Endpoint schemas** — `_API_REFERENCE.md`
- **Daily ops procedures** — `_BUILD.md`

---

*Document version: 1.0 · Last updated: 2026-04-27*
