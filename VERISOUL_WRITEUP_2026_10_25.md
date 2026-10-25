# Verisoul device-intelligence SDK — client-side drill-down

**Date:** 2026-10-25
**Subject:** public Verisoul Web SDK (`js.verisoul.ai/<env>/bundle.js`) and its
sandbox backend
**Method:** passive/public-asset review + local browser instrumentation.
All telemetry POSTs were fulfilled locally — nothing was forwarded to Verisoul.
No customer/prod traffic, no API keys, no dashboard access.

---

## 1. Executive summary

Verisoul's Web SDK is a ~291 KB script with a **server-minted, per-fetch token
model** (each bundle delivery carries its own `session_token`), a plaintext
telemetry envelope, and one opaque blob — `dd` — that we fully reverse-engineered
and **validated decrypt to 100%**: it is a self-decrypting XOR obfuscation, not
cryptography.

**The headline findings:**

1. **Per-fetch token binding (the "good" design):** every request to
   `js.verisoul.ai/sandbox/bundle.js` returns a bundle with a *fresh*
   `__vs_token_preamble` — `generation` (UUID), `session_token`,
   `build_token`, `stun_token`, `cf_token`, TTLs — injected by the edge.
   The SDK later exchanges it via `/collect` and `/refresh`; `session_id`s
   expire after 24h. This is real server-side anti-replay state.
2. **Telemetry is plaintext JSON** — the `/collect` body carries
   `project_id, bundle_id, session_token(s), token_generation, ice_candidates`
   in the clear, plus the `dd` blob.
3. **The `dd` blob is obfuscation, not encryption:** its cipher is a 32-byte
   period XOR keystream (`splitmix32(per-build seed) ⊕ 16B per-run key`) where
   the **16-byte key is prepended to the blob in cleartext**. We recovered the
   algorithm from the obfuscated bundle, validated it byte-for-byte against a
   same-run capture (100% match), and recovered the plaintext: a **195-field
   device/bot-detection object** with readable key names.
4. **The SDK is an anti-bot instrument:** the readable payload is dominated by
   `bot_*` signals (webdriver, CDP probes, CefSharp/Playwright/Selenium checks,
   dev-tools-open, iframe tampering counts, canvas-jpeg support, emoji/font/CSS
   fingerprints, worker-realm cross-checks, HWID/WebGPU probes, DRM matrix).
5. **Obfuscation rotates per delivery** (identifiers *and constants* change on
   every fetch) and the string-table key is tied to real DOM values — a subtle
   integrity mechanism — but the *logic* is stable and entirely client-side.

---

## 2. Where it lives

| Asset | URL |
|---|---|
| Docs | `docs.verisoul.ai` (integration, custom hostname, signals) |
| SDK (per env) | `https://js.verisoul.ai/{env}/bundle.js` (`prod` / `sandbox`) |
| Code | `sandbox.js.verisoul.ai` (redirect target), ~291–292 KB |
| Load | `<script async src=".../bundle.js" verisoul-project-id="...">` |
| Window API | `Verisoul.session()` → `{session_id}`; `Verisoul.account({...})` |
| Backends | `gnet.<env>.verisoul.ai` (`/collect`, `/refresh`, `bhve.js`), `signals.gnet.<env>`, `usc1.gnet.<env>/events`, `cf-enrich.<env>.verisoul.ai/` |

The SDK is a two-stage loader: `bundle.js` then fetches `bhve.js` (a 16 KB
behavioral event engine with **WebSocket** streaming + `sendBeacon` fallback —
keydown/touchstart/click/move via `/bhve` frames) plus `/network-signals/tls/frame`.
CSP guidance implies TLS fingerprinting and WebSocket signal transport.

---

## 3. Token model (observed)

Every `bundle.js` fetch returns a different preamble (verified across fetches):

```
window.__vs_token_preamble = {
  v:1, state:"pending", generation:"<uuid>",
  session_token: "<~430-char opaque>", build_token: "<~200-char>",
  // + internally: stun_token, cf_token, soft/hard_ttl_ms, issued_at_ms,
  //   session_expires_at_ms, max_age_ms, drm_wv, network_signals_origin
}
```

The SDK then POSTs to `gnet.<env>/collect` (with `project_id, bundle_id,
session_token, build_token, token_generation, dd, obf_id, ice_candidates`) and
`/refresh` (`session_token`), and `cf-enrich` (`{stun, project_id}`).
Responses carry `session_id` (36-char), which the server later validates
against `session_token` — that's the replay-resistance mechanism: **the client
cannot mint a valid session without the server-issued token**, and the token is
per bundle-fetch.

## 4. The readable payload — what `dd` really contains

We captured the full `device_data` object with **original key names** (195
fields) via a `JSON.stringify` boundary hook, and separately validated the
offline decrypt of `dd` (100% byte match). Highlights:

**GPU / WebGL** — `gpu_vendor`, `gpu_renderer` (`ANGLE … SwiftShader …` =
headless tell), `gpu_parameters_hash`, `gpu_extensions_hash`, `gpu_extra_hash`,
`webgpu_*`, `hwid_ok/hwid_reason` (`no-adapter` in headless).

**Bot detection (the core)** —
`bot_webdriver:1`, `bot_cdp_proto_proxy:1`, `bot_cdp_error_prototype`,
`bot_cdp_prepare_stack_trace`, `bot_spoofed_create_element`,
`bot_spoofed_to_string`, `bot_high_chrome_index`, `bot_constructor_aliases`,
`bot_canvas_jpeg_support`, `bot_inconsistent_mime_type_protos`,
`bot_user_activation_*`, `bot_event_count_{click,keydown,mousemove,pointerdown}`,
`bot_cefsharp` (+bindings), `bot_chrome_app_method_names_wrong`,
`bot_iframe_srcdoc_marker`, `bot_shadow_dom_{closed,native}`,
`bot_document_has_focus`, `bot_ui_bars_visible`, `bot_dev_tools_open:1`,
`bot_window_{outer,inner}_{width,height}`, `bot_url_protocol_quirk:"c:"`,
`bot_private_click_measurement`, `bot_webdriver_iframe:1`,
`bot_screen_from_iframe_*`, `bot_iframe_tampering_counts:[7,7,0,0,0]`,
`bot_webdriver_type_mismatch`, `bot_chrome_iframe_mismatch`,
`bot_anti_detect_chrome:"no_extension"`.

**Worker-realm cross-checks** — `worker_user_agent`, `worker_webgl_renderer`,
`worker_webdriver:-888` (absent), `worker_uach_*`, `worker_timezone`,
`worker_device_memory` — the main-thread vs worker discrepancy is itself a signal.

**Device / UA / hints** — `device_client_hints_*` (architecture `x86`,
bitness `64`, wow64, brands), `device_platform`, `device_user_agent`,
`device_cores:12`, `device_memory:32`, `device_connection_*`,
`engine_detected:"chromium"`, `browser_id` (UUID), `browser_timezone`,
`browser_calendar`, `browser_numbering_system`.

**Fingerprint hashes** — `emoji_hashes`/`emoji_non_black`/`emoji_color_sum`
(icon-set detection), `font_hits_{win,linux,android,apple}`, `font_detected`
(list), `font_platform/subtype`, `math_fingerprint_hash`,
`text_shaping_hash`, `css_media_matches`, `css_system_colors`,
`css_scrollbar_{width,overlay}`, `audio_fingerprint:124.04`+`base_latency`,
`media_rtc_video_capabilities_hash`, `media_drm_{widevine,playready,clearkey,
fairplay}`, `media_speech_*`, `sensor_motion`, `sensor_battery_*`,
`hardware_{usb,hid,serial,bluetooth,nfc}`, `privacy_incognito:1`,
`timing_precision:0.1`, `collection_duration_ms`.

## 5. The `dd` cipher — full reverse-engineering

Recovered from the obfuscated bundle (string table decoded offline + runtime
decode map + call-stack tracing):

```
encode(dd) = b64( u[16] || E )
  E = ( mU(16) || JSON(QZ-renamed device_data) ) XOR keystream
  keystream[s] = splitmix32(pg)[s%32] XOR u[s%16]     // period 32
  u  = crypto.getRandomValues(16)   ← the per-run key, PREPENDED IN CLEARTEXT
  mU = random 16B prefix (skipped on decode)
  QZ = hardcoded 197-entry key-rename map (long → short, e.g. 195 fields kept)
  pg = per-build PRNG seed constant (rotates per delivery)
```

**Validation:** same-run capture — `dd` (3,139 B) vs the known renamed-JSON
plaintext (3,107 B) — `E[s]⊕P[s]` is exactly periodic with period 32 at offset
16: **100% byte match**. The "encryption" therefore protects nothing: the key
sits in the blob, and the keystream base is a hardcoded constant in the same
bundle that ships to the attacker.

## 6. Obfuscation / anti-integrity notes

- **Per-delivery rotation:** identifiers *and numeric constants* change on
  every `bundle.js` fetch; the string-table base64 and its decode keystream
  constant differ per build. Static anchors don't survive across fetches —
  hooks must be structural.
- **DOM-keyed string table:** the decoder seed `dz` folds
  `screen.pixelDepth`, `Node.*` constants, `XMLHttpRequest.DONE`,
  `Element.name` through FNV — lying about those breaks string decoding
  (fragile, but a real integrity cross-check).
- **`stale-bundle` refresh:** the SDK re-fetches the bundle on staleness and
  re-injects the token preamble.
- **Disable flags:** `window.__vs_disable_{behavioral,events,frontiers,
  network_signals}` are honored if present (test seams — a potential
  suppression vector worth noting).

## 7. What it proves / (ab)use

- **The client is fully readable and rewritable.** `dd` decrypts with the
  bundle in hand; the envelope is plaintext. A bot operator can:
  1. read exactly which `bot_*` flags fired and patch the SDK to lie about
     them (e.g., force `bot_webdriver:0`, spoof emoji/font hashes),
  2. replay the crypto layer 1:1 (same cipher, prepended key),
  3. or simply strip/blank `device_data` and ship `{}` — the server sees
     "no device data" instead of a lying fingerprint.
- **The durable boundary is the server-issued token**: without a fresh
  `session_token` from the edge, the client cannot produce a session the
  backend accepts — that part is real. What the token does NOT do is
  authenticate the *payload content*.

## 8. Honest boundaries

- Telemetry was fulfilled locally; **no real `session_id` was obtained** and
  no backend prediction was requested. We did not verify server-side verdict
  behavior.
- The dd decrypt was validated against same-run captures of the sandbox build;
  prod builds rotate constants but the algorithm is identical in structure.
- We did not decrypt a *server-issued* `session_token` (those are opaque to
  the client by design) — only the client-made `dd` blob.
- No customer/prod sites, no keys, no dashboard access.

## 9. Interview talking points

1. "Verisoul gets one thing right: a server-minted, per-fetch session token
   that the client can't forge — real anti-replay state."
2. "…but the device blob it protects is XOR-obfuscated with the key prepended
   in cleartext; I recovered the cipher, validated it 100%, and read all 195
   signals — including every `bot_*` flag they ship."
3. "The per-build constant rotation + DOM-keyed string table is clever
   integrity-by-obfuscation, but it's client code that ships to the attacker;
   it raises the cost, it doesn't create trust."
4. "The right boundary: server-issued token for session validity + server-side
   fingerprint/behavioral correlation — never trust the client's claim of
   'not a bot'."

## 10. Artifacts

| File | Purpose |
|---|---|
| `bots/verisoul-probe.mjs` | Loads sandbox bundle; captures network + POST bodies |
| `bots/verisoul-q1t.mjs` | Offline string-table decoder dump (Hj+FNV key) |
| `bots/verisoul-btoa.mjs` | base64-boundary + JSON.stringify hooks |
| `bots/verisoul-decode-map.mjs` | Structural hooks: runtime decode map, call stacks, cR input capture, JSON.stringify capture + dd decrypt validation |
| `/tmp/opencode/verisoul/verisoul-device-data.json` | **The full 195-field readable payload (original keys)** |
| `/tmp/opencode/verisoul/decode-map-uniq.json` | 1,281 decoded (index → string) entries |
| `/tmp/opencode/verisoul/verisoul-strings.json` | Offline string-table dump (1,755) |
| `/tmp/opencode/verisoul/json-caps.json` | Original + QZ-renamed device_data + collect envelope captures |
| `/tmp/opencode/verisoul/collects-*.json` | Raw `/collect` bodies incl. `dd` |
| `/tmp/opencode/verisoul/bundle-served.js` | One instrumented served build (constants per build) |
