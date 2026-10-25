# Verisoul device_data — full payload printout

**Source:** live sandbox run, captured pre-obfuscation with ORIGINAL key names (see `scripts/verisoul-visual.mjs`). 195 fields. Values are from a headless Chromium test browser — the *schema* is what matters.

| # | field | value | note |
|---|---|---|---|
| 1 | `audio_base_latency` | `0.010666666666666666` |  |
| 2 | `audio_fingerprint` | `124.04347776696522` |  |
| 3 | `bot_anti_detect_chrome` | `no_extension` | anti-detect browser extension fingerprint |
| 4 | `bot_browser_integrity_codes` | `[3]` | browser integrity feature codes |
| 5 | `bot_canvas_jpeg_support` | `1` | canvas toDataURL jpeg support probe |
| 6 | `bot_cdp_error_prototype` | `0` |  |
| 7 | `bot_cdp_leaks` | `[]` |  |
| 8 | `bot_cdp_prepare_stack_trace` | `1` | CDP prepareStackTrace hook |
| 9 | `bot_cdp_proto_proxy` | `0` | CDP protocol proxy present (devtools/automation) |
| 10 | `bot_cefsharp` | `0` | CefSharp (embedded Chromium) detection |
| 11 | `bot_cefsharp_bindings` | `[]` | CefSharp (embedded Chromium) detection |
| 12 | `bot_chrome_app_method_names_wrong` | `[]` |  |
| 13 | `bot_chrome_iframe_mismatch` | `0` |  |
| 14 | `bot_chrome_runtime_missing` | `1` |  |
| 15 | `bot_constructor_aliases` | `[]` | native constructor alias check |
| 16 | `bot_dev_tools_open` | `1` | devtools open detection |
| 17 | `bot_display_consistency_mismatch` | `0` |  |
| 18 | `bot_document_has_focus` | `1` |  |
| 19 | `bot_event_count_click` | `0` | behavioral event counters (click/keydown/mousemove/pointerdown) |
| 20 | `bot_event_count_keydown` | `0` | behavioral event counters (click/keydown/mousemove/pointerdown) |
| 21 | `bot_event_count_mousemove` | `0` | behavioral event counters (click/keydown/mousemove/pointerdown) |
| 22 | `bot_event_count_pointerdown` | `0` | behavioral event counters (click/keydown/mousemove/pointerdown) |
| 23 | `bot_high_chrome_index` | `0` |  |
| 24 | `bot_iframe_srcdoc_marker` | `null_string` |  |
| 25 | `bot_iframe_tampering_counts` | `[7, 7, 0, 0, 0]` | per-realm tamper counters (7,7,0,0,0) |
| 26 | `bot_inconsistent_mime_type_protos` | `0` |  |
| 27 | `bot_languages_getter_pattern` | `null_string` | languages getter pattern check |
| 28 | `bot_languages_mutability` | `0` |  |
| 29 | `bot_nan_byte` | `255` |  |
| 30 | `bot_nan_payload_hex` | `0x7ff8000123450000` |  |
| 31 | `bot_notification_inconsistency` | `-888` |  |
| 32 | `bot_plugin_prototype_valid` | `1` |  |
| 33 | `bot_private_click_measurement` | `0` | PCM (private click measurement) flag |
| 34 | `bot_restricted_apis` | `[]` |  |
| 35 | `bot_screen_from_iframe_height` | `940` | screen metrics from iframe realm |
| 36 | `bot_screen_from_iframe_width` | `1020` | screen metrics from iframe realm |
| 37 | `bot_shadow_dom_closed` | `1` |  |
| 38 | `bot_shadow_dom_native` | `1` |  |
| 39 | `bot_spoofed_create_element` | `0` |  |
| 40 | `bot_spoofed_to_string` | `0` |  |
| 41 | `bot_tampered_properties` | `[]` |  |
| 42 | `bot_ui_bars_visible` | `1` |  |
| 43 | `bot_url_protocol_quirk` | `c:` | URL.protocol quirk probe (c:) |
| 44 | `bot_user_activation_has_been_active` | `1` | user activation state (autoplay etc.) |
| 45 | `bot_user_activation_is_active` | `1` | user activation state (autoplay etc.) |
| 46 | `bot_webdriver` | `1` | navigator.webdriver — 1 = automated browser |
| 47 | `bot_webdriver_iframe` | `1` | navigator.webdriver — 1 = automated browser |
| 48 | `bot_webdriver_type_mismatch` | `0` | navigator.webdriver — 1 = automated browser |
| 49 | `bot_window_external_string` | `[object External]` | outer/inner window dimensions consistency |
| 50 | `bot_window_inner_height` | `940` | outer/inner window dimensions consistency |
| 51 | `bot_window_inner_width` | `1020` | outer/inner window dimensions consistency |
| 52 | `bot_window_outer_height` | `1025` | outer/inner window dimensions consistency |
| 53 | `bot_window_outer_width` | `1028` | outer/inner window dimensions consistency |
| 54 | `browser_calendar` | `gregory` | locale, timezone, calendar, numbering system, plugins, cookies |
| 55 | `browser_cookie_enabled` | `1` | locale, timezone, calendar, numbering system, plugins, cookies |
| 56 | `browser_do_not_track` | `null_string` | locale, timezone, calendar, numbering system, plugins, cookies |
| 57 | `browser_id` | `0e960312-9d21-4467-a746-1896b68da627` | locale, timezone, calendar, numbering system, plugins, cookies |
| 58 | `browser_language` | `en-US` | locale, timezone, calendar, numbering system, plugins, cookies |
| 59 | `browser_languages` | `["en-US", "en"]` | locale, timezone, calendar, numbering system, plugins, cookies |
| 60 | `browser_locale` | `en-US` | locale, timezone, calendar, numbering system, plugins, cookies |
| 61 | `browser_notification_permission` | `default` | locale, timezone, calendar, numbering system, plugins, cookies |
| 62 | `browser_numbering_system` | `latn` | locale, timezone, calendar, numbering system, plugins, cookies |
| 63 | `browser_plugin_count` | `5` | locale, timezone, calendar, numbering system, plugins, cookies |
| 64 | `browser_secure_context` | `1` | locale, timezone, calendar, numbering system, plugins, cookies |
| 65 | `browser_storage_quota_mb` | `10240` | locale, timezone, calendar, numbering system, plugins, cookies |
| 66 | `browser_timezone` | `America/Chicago` | locale, timezone, calendar, numbering system, plugins, cookies |
| 67 | `browser_timezone_offset` | `300` | locale, timezone, calendar, numbering system, plugins, cookies |
| 68 | `collection_duration_ms` | `215.3` | device-data collection duration |
| 69 | `css_locale_input_widths` | `[125, 253]` | CSS probes: media queries, system colors, scrollbar, text widths |
| 70 | `css_media_matches` | `["hover_true", "any_hover_true", "color_gamut_srgb", "pointer_fine", "any_pointer_fine", "scripting_enabled", "orientation_landscape", "overflow_block` | CSS probes: media queries, system colors, scrollbar, text widths |
| 71 | `css_scrollbar_overlay` | `0` | CSS probes: media queries, system colors, scrollbar, text widths |
| 72 | `css_scrollbar_width` | `15` | CSS probes: media queries, system colors, scrollbar, text widths |
| 73 | `css_system_colors` | `["Canvas:rgb(255, 255, 255)", "ButtonFace:rgb(239, 239, 239)", "Highlight:rgba(0, 65, 198, 0.8)"]` | CSS probes: media queries, system colors, scrollbar, text widths |
| 74 | `css_text_width_emoji` | `[99.828125, 99.828125, 99.828125, 99.828125]` | CSS probes: media queries, system colors, scrollbar, text widths |
| 75 | `css_text_width_language` | `[23.28125, 128.609375, 28.484375, 54.25]` | CSS probes: media queries, system colors, scrollbar, text widths |
| 76 | `css_text_width_unicode` | `[22.890625, 21.84375, 22.890625, 23.28125]` | CSS probes: media queries, system colors, scrollbar, text widths |
| 77 | `device_architecture` | `255` | platform/UA/cores/memory/pdf/connection |
| 78 | `device_client_hints_architecture` | `x86` | UA-CH: architecture, bitness, wow64, brands, full version list |
| 79 | `device_client_hints_bitness` | `64` | UA-CH: architecture, bitness, wow64, brands, full version list |
| 80 | `device_client_hints_brands` | `["Not:A-Brand;v=8", "Chromium;v=156"]` | UA-CH: architecture, bitness, wow64, brands, full version list |
| 81 | `device_client_hints_full_version_list` | `["Not:A-Brand;v=8.0.0.0", "Chromium;v=156.0.8078.4"]` | UA-CH: architecture, bitness, wow64, brands, full version list |
| 82 | `device_client_hints_mobile` | `0` | UA-CH: architecture, bitness, wow64, brands, full version list |
| 83 | `device_client_hints_model` | `` | UA-CH: architecture, bitness, wow64, brands, full version list |
| 84 | `device_client_hints_platform` | `Linux` | UA-CH: architecture, bitness, wow64, brands, full version list |
| 85 | `device_client_hints_platform_version` | `` | UA-CH: architecture, bitness, wow64, brands, full version list |
| 86 | `device_client_hints_wow64` | `0` | UA-CH: architecture, bitness, wow64, brands, full version list |
| 87 | `device_connection_downlink` | `0` | platform/UA/cores/memory/pdf/connection |
| 88 | `device_connection_effective_type` | `4g` | platform/UA/cores/memory/pdf/connection |
| 89 | `device_connection_rtt` | `100` | platform/UA/cores/memory/pdf/connection |
| 90 | `device_cores` | `12` | platform/UA/cores/memory/pdf/connection |
| 91 | `device_memory` | `32` | platform/UA/cores/memory/pdf/connection |
| 92 | `device_pdf_viewer_enabled` | `1` | platform/UA/cores/memory/pdf/connection |
| 93 | `device_platform` | `Linux x86_64` | platform/UA/cores/memory/pdf/connection |
| 94 | `device_user_agent` | `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36` | platform/UA/cores/memory/pdf/connection |
| 95 | `device_vendor` | `Google Inc.` | platform/UA/cores/memory/pdf/connection |
| 96 | `drm_pr_key_system` | `null_string` |  |
| 97 | `drm_pr_ms` | `0` |  |
| 98 | `drm_pr_state` | `0` |  |
| 99 | `drm_wv_ms` | `0` |  |
| 100 | `drm_wv_state` | `0` |  |
| 101 | `emoji_color_sum` | `[75715, 77922, 43704, 55807, 95259, 75715]` |  |
| 102 | `emoji_hashes` | `[24132248, 3574857351, 310021178, 4042381990, 3349100610, 24132248]` |  |
| 103 | `emoji_non_black` | `[195, 190, 134, 188, 177, 195]` |  |
| 104 | `engine_detected` | `chromium` | engine guess (chromium) |
| 105 | `font_detected` | `["Ubuntu", "Ubuntu Mono", "Noto Sans", "DejaVu Serif", "Liberation Sans"]` | font availability/rendering fingerprint (per-OS hits, detected list) |
| 106 | `font_hits_android` | `-888` | font availability/rendering fingerprint (per-OS hits, detected list) |
| 107 | `font_hits_apple` | `-888` | font availability/rendering fingerprint (per-OS hits, detected list) |
| 108 | `font_hits_linux` | `1` | font availability/rendering fingerprint (per-OS hits, detected list) |
| 109 | `font_hits_win` | `-888` | font availability/rendering fingerprint (per-OS hits, detected list) |
| 110 | `font_platform` | `linux` | font availability/rendering fingerprint (per-OS hits, detected list) |
| 111 | `font_platform_version` | `null_string` | font availability/rendering fingerprint (per-OS hits, detected list) |
| 112 | `font_pref_system_ui` | `150` | font availability/rendering fingerprint (per-OS hits, detected list) |
| 113 | `font_radio_family` | `Arial` | font availability/rendering fingerprint (per-OS hits, detected list) |
| 114 | `font_subtype` | `chromeOS` | font availability/rendering fingerprint (per-OS hits, detected list) |
| 115 | `font_version_win` | `null_string` | font availability/rendering fingerprint (per-OS hits, detected list) |
| 116 | `gpu_extensions_hash` | `3430651190` |  |
| 117 | `gpu_extra_hash` | `2088728911` |  |
| 118 | `gpu_parameters_hash` | `2744569458` |  |
| 119 | `gpu_renderer` | `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)` |  |
| 120 | `gpu_vendor` | `Google Inc. (Google)` |  |
| 121 | `hardware_bluetooth` | `0` | WebUSB/HID/serial/Bluetooth/NFC/SAB/COI availability |
| 122 | `hardware_cross_origin_isolated` | `0` | WebUSB/HID/serial/Bluetooth/NFC/SAB/COI availability |
| 123 | `hardware_hid` | `1` | WebUSB/HID/serial/Bluetooth/NFC/SAB/COI availability |
| 124 | `hardware_nfc` | `0` | WebUSB/HID/serial/Bluetooth/NFC/SAB/COI availability |
| 125 | `hardware_serial` | `1` | WebUSB/HID/serial/Bluetooth/NFC/SAB/COI availability |
| 126 | `hardware_shared_array_buffer` | `0` | WebUSB/HID/serial/Bluetooth/NFC/SAB/COI availability |
| 127 | `hardware_usb` | `1` | WebUSB/HID/serial/Bluetooth/NFC/SAB/COI availability |
| 128 | `hwid_alu` | `[]` |  |
| 129 | `hwid_cores` | `[]` |  |
| 130 | `hwid_cores_cfg` | `[]` |  |
| 131 | `hwid_env_features` | `[]` |  |
| 132 | `hwid_env_limits` | `[]` |  |
| 133 | `hwid_ms` | `187` |  |
| 134 | `hwid_ok` | `0` |  |
| 135 | `hwid_reason` | `no-adapter` |  |
| 136 | `hwid_simd_frac` | `[]` | SIMD width/architecture probes |
| 137 | `hwid_simd_sched` | `null_string` | SIMD width/architecture probes |
| 138 | `hwid_simd_width` | `-888` | SIMD width/architecture probes |
| 139 | `math_fingerprint_hash` | `2705196489` | Math API fingerprint hash |
| 140 | `media_device_audio_in` | `0` | platform/UA/cores/memory/pdf/connection |
| 141 | `media_device_audio_out` | `1` | platform/UA/cores/memory/pdf/connection |
| 142 | `media_device_video_in` | `0` | platform/UA/cores/memory/pdf/connection |
| 143 | `media_drm_clearkey` | `1` | DRM matrix: widevine/playready/clearkey/fairplay |
| 144 | `media_drm_fairplay` | `0` | DRM matrix: widevine/playready/clearkey/fairplay |
| 145 | `media_drm_hash` | `328864667` | DRM matrix: widevine/playready/clearkey/fairplay |
| 146 | `media_drm_playready` | `0` | DRM matrix: widevine/playready/clearkey/fairplay |
| 147 | `media_drm_robustness_playready` | `0` | DRM matrix: widevine/playready/clearkey/fairplay |
| 148 | `media_drm_robustness_widevine` | `2` | DRM matrix: widevine/playready/clearkey/fairplay |
| 149 | `media_drm_system_count` | `2` | DRM matrix: widevine/playready/clearkey/fairplay |
| 150 | `media_drm_widevine` | `1` | DRM matrix: widevine/playready/clearkey/fairplay |
| 151 | `media_rtc_video_capabilities_hash` | `3097032447` | WebRTC video capabilities |
| 152 | `media_source_codecs_supported` | `10` |  |
| 153 | `media_speech_android_voice` | `-888` | speech synthesis voices |
| 154 | `media_speech_voice_count` | `-888` | speech synthesis voices |
| 155 | `media_speech_voice_hash` | `-888` | speech synthesis voices |
| 156 | `media_speech_voice_languages` | `[]` | speech synthesis voices |
| 157 | `media_speech_voices` | `[]` | speech synthesis voices |
| 158 | `privacy_incognito` | `0` | incognito / private-mode detection |
| 159 | `screen_avail_height` | `940` | screen metrics (width/height/avail/depth/pixel-ratio) |
| 160 | `screen_avail_width` | `1020` | screen metrics (width/height/avail/depth/pixel-ratio) |
| 161 | `screen_color_depth` | `24` | screen metrics (width/height/avail/depth/pixel-ratio) |
| 162 | `screen_height` | `940` | screen metrics (width/height/avail/depth/pixel-ratio) |
| 163 | `screen_pixel_ratio` | `1` | screen metrics (width/height/avail/depth/pixel-ratio) |
| 164 | `screen_width` | `1020` | screen metrics (width/height/avail/depth/pixel-ratio) |
| 165 | `sensor_battery_charging` | `1` | motion + battery |
| 166 | `sensor_battery_level` | `1` | motion + battery |
| 167 | `sensor_motion` | `[]` | motion + battery |
| 168 | `text_shaping_hash` | `1776572626` | text shaping (canvas measure) hash |
| 169 | `timing_precision` | `0.1` | performance.now() precision |
| 170 | `touch_event` | `0` | touch support probes |
| 171 | `touch_max_points` | `0` | touch support probes |
| 172 | `touch_start` | `0` | touch support probes |
| 173 | `webgpu_architecture` | `null_string` | WebGPU adapter info |
| 174 | `webgpu_device` | `null_string` | WebGPU adapter info |
| 175 | `webgpu_extra_hash` | `-888` | WebGPU adapter info |
| 176 | `webgpu_is_fallback` | `-888` | WebGPU adapter info |
| 177 | `webgpu_supported` | `1` | WebGPU adapter info |
| 178 | `webgpu_vendor` | `null_string` | WebGPU adapter info |
| 179 | `worker_device_memory` | `32` | worker-realm cross-check vs main thread (consistency signal) |
| 180 | `worker_hardware_concurrency` | `12` | worker-realm cross-check vs main thread (consistency signal) |
| 181 | `worker_language` | `en-US` | worker-realm cross-check vs main thread (consistency signal) |
| 182 | `worker_languages` | `["en-US", "en"]` | worker-realm cross-check vs main thread (consistency signal) |
| 183 | `worker_locale` | `en-US` | worker-realm cross-check vs main thread (consistency signal) |
| 184 | `worker_on_line` | `1` | worker-realm cross-check vs main thread (consistency signal) |
| 185 | `worker_platform` | `Linux x86_64` | worker-realm cross-check vs main thread (consistency signal) |
| 186 | `worker_product` | `Gecko` | worker-realm cross-check vs main thread (consistency signal) |
| 187 | `worker_timezone` | `America/Chicago` | worker-realm cross-check vs main thread (consistency signal) |
| 188 | `worker_uach_full_version` | `156.0.8078.4` | worker-realm cross-check vs main thread (consistency signal) |
| 189 | `worker_uach_model` | `` | worker-realm cross-check vs main thread (consistency signal) |
| 190 | `worker_uach_platform` | `Linux` | worker-realm cross-check vs main thread (consistency signal) |
| 191 | `worker_uach_platform_version` | `` | worker-realm cross-check vs main thread (consistency signal) |
| 192 | `worker_user_agent` | `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36` | worker-realm cross-check vs main thread (consistency signal) |
| 193 | `worker_vendor` | `null_string` | worker-realm cross-check vs main thread (consistency signal) |
| 194 | `worker_webdriver` | `-888` | webdriver flag in worker realm (-888 = absent) |
| 195 | `worker_webgl_renderer` | `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)` | worker-realm cross-check vs main thread (consistency signal) |
