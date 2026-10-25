#!/usr/bin/env node
/**
 * verisoul-visual.mjs — HEADED demo: load the real Verisoul sandbox SDK,
 * intercept everything locally, and render the full readable 195-field
 * device/bot-detection payload (original keys) + the token preamble + the
 * dd-cipher facts, in a visible browser window.
 *
 * Structural hooks (immune to per-delivery identifier rotation):
 *   - string decoder → capture every (index → string) decode
 *   - JSON.stringify (document-start) → capture the device_data object with
 *     ORIGINAL keys, the QZ-renamed copy, and the collect envelope
 *   - /collect, /refresh, cf-enrich → fulfilled locally, never forwarded
 *
 * Usage:
 *   node scripts/verisoul-visual.mjs      (close the window to exit)
 *   saves screenshots/verisoul-*.png after rendering
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8950;

// ---------------------------------------------------------------------------
// Page: terminal-style control panel + render targets (heavily instrumented)
// ---------------------------------------------------------------------------
const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Verisoul — reliable payload captured live (authorized demo)</title>
<style>
  body{background:#0d1117;color:#e6edf3;font-family:ui-monospace,Menlo,Consolas,monospace;margin:0}
  #wrap{max-width:1040px;margin:0 auto;padding:24px}
  h1{font-size:18px;color:#58a6ff;margin:0 0 4px}
  .sub{color:#8b949e;font-size:12px;margin:0 0 14px}
  #log{background:#010409;border:1px solid #30363d;border-radius:8px;padding:12px 14px;
       font-size:12px;line-height:1.5;max-height:230px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;margin-bottom:16px}
  .ok{color:#3fb950}.warn{color:#d29922}.bad{color:#f85149}.dim{color:#8b949e}.acc{color:#58a6ff}.hex{color:#d2a8ff}
  h2{font-size:13px;color:#58a6ff;margin:16px 0 4px;letter-spacing:.5px}
  h3{font-size:12px;color:#8b949e;margin:12px 0 2px;font-weight:normal;letter-spacing:.4px}
  table{border-collapse:collapse;width:100%;font-size:12px;margin:4px 0 12px}
  th,td{border:1px solid #30363d;padding:3px 8px;text-align:left;vertical-align:top;word-break:break-all}
  th{background:#161b22;color:#8b949e;font-weight:normal;text-transform:uppercase;font-size:10px;letter-spacing:.5px}
  tr.tell td{background:#3a1414} tr.tell td.k{color:#ff7b72;font-weight:bold}
  .k{color:#a5d6ff;white-space:nowrap}.dim{color:#8b949e}
  .big{background:#010409;border:1px solid #30363d;border-radius:8px;padding:12px 14px;font-size:12px;line-height:1.7;margin:4px 0 14px;overflow:auto}
  .big b{color:#a5d6ff}
</style></head>
<body><div id="wrap">
  <h1>Verisoul Web SDK — live capture: tokens · envelope · full readable payload</h1>
  <p class="sub">real sandbox bundle (js.verisoul.ai/sandbox) with read-only structural hooks · all telemetry fulfilled locally, never forwarded</p>
  <div id="log"></div>
  <div id="out"></div>
</div>
<script async src="https://js.verisoul.ai/sandbox/bundle.js" verisoul-project-id="probe-test-0000"></script>
<script>
window.__log=function(cls,line){ const el=document.getElementById('log');
  const d=document.createElement('div'); d.className=cls||'';
  d.textContent='['+String(Date.now()).slice(-6)+'] '+line; el.appendChild(d); el.scrollTop=el.scrollHeight; };
window.__render=function(id, h){ const el=document.getElementById(id); const d=document.createElement('div'); d.innerHTML=h; el.appendChild(d); };
</script></body></html>`;

const server = createServer((req,res)=>{
  if (req.url === '/') { res.writeHead(200,{'content-type':'text/html'}); res.end(html); }
  else { res.writeHead(200,{'content-type':'text/plain'}); res.end('ok'); }
});
await new Promise(r=>server.listen(PORT,'127.0.0.1',r));

const browser = await chromium.launch({ headless:false, args:['--window-size=1080,960'] });
const ctx = await browser.newContext({ viewport:{ width:1020, height:940 } });

// document-start hooks: JSON.stringify capture of large objects
await ctx.addInitScript(()=>{
  const oS = JSON.stringify;
  JSON.stringify = function(v, r, sp){
    let out;
    try { out = oS.call(this, v, r, sp); } catch(e) { try { out = oS.call(this, v); } catch(e2){ return undefined; } }
    try {
      if (typeof out === 'string' && out.length > 1500 && v && typeof v === 'object' && !Array.isArray(v)) {
        window.__vsJson = window.__vsJson || [];
        if (window.__vsJson.length < 60) window.__vsJson.push({ len: out.length, keys: Object.keys(v).slice(0,220), json: out });
      }
    } catch(_) {}
    return out;
  };
});
const page = await ctx.newPage();
const L = cls => txt => page.evaluate(([c,t])=>window.__log(c,t), [cls,txt]).catch(()=>{});
const step = async (cls, txt)=>{ await L(cls)(txt); await new Promise(r=>setTimeout(r,450)); };
const sleep = ms => new Promise(r=>setTimeout(r,ms));

const traffic = [];
await page.route('**/bundle.js*', async route => {
  const resp = await route.fetch();
  let body = await resp.text();
  traffic.push({ what:'bundle.js', len: body.length });
  // structural: hook the string decoder (atob+TextDecoder trace) for the decode map
  const re = /(var \w+=new TextDecoder\(\)\.decode\([A-Za-z_$][\w$]*\);)([A-Za-z_$][\w$]*)\[([A-Za-z_$][\w$]*)\]=([A-Za-z_$][\w$]*);return \4;/;
  const m = body.match(re);
  if (m) {
    const hook = `${m[1]}try{window.__vsD=window.__vsD||[],window.__vsD.length<20000&&window.__vsD.push([${m[3]},${m[4]}])}catch(_){};${m[2]}[${m[3]}]=${m[4]};return ${m[4]};`;
    body = body.replace(m[0], hook);
  }
  const servB64 = await page.evaluate(()=>{ try{ return btoa(JSON.stringify({t:1})); }catch(_){ return ''; } }).catch(()=>'');
  await route.fulfill({ status:200, contentType:'application/javascript', body });
});
await page.route('**/collect', async route => {
  const pd = route.request().postData() || '';
  traffic.push({ what:'POST /collect', len: pd.length });
  await route.fulfill({ status:200, contentType:'application/json', body:'{}' });
});
await page.route('**/refresh', r=>{ traffic.push({what:'POST /refresh'}); return r.fulfill({ status:200, contentType:'application/json', body:'{}' }); });
await page.route('**/cf-enrich*', r=>{ traffic.push({what:'POST cf-enrich'}); return r.fulfill({ status:200, contentType:'application/json', body:'{}' }); });
await page.route('**/bhve*', r=>r.fulfill({ status:200, contentType:'application/json', body:'{}' }));

await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil:'load' });
await step('dim','[*] loading real sandbox bundle (structural hooks applied in flight) …');
await step('acc','[*] SDK init · per-fetch server-minted token preamble injected by edge');
await page.waitForFunction(()=>window.__vsJson && window.__vsJson.length>=3, { timeout:25000 }).catch(()=>{});
await sleep(2500);

const vsJson = await page.evaluate(()=>window.__vsJson||[]).catch(()=>[]);
const preamble = await page.evaluate(()=>{ const p=window.__vs_token_preamble||{}; return { v:p.v, state:p.state, generation:p.generation, session_token:(p.session_token||'').slice(0,60), build_token:(p.build_token||'').slice(0,40), bundle_id:window.__vs_bundle_id||'', backend:window.__vs_backend_origin||'' }; }).catch(()=>null);
const decodes = await page.evaluate(()=>window.__vsD||[]).catch(()=>[]);

// pick captures: original-keys device_data (big), renamed (3-4k), envelope
const origCap = [...vsJson].sort((a,b)=>b.len-a.len).find(c=>c.keys && c.keys.length>100);
const collectCap = vsJson.find(c=>c.keys && c.keys.includes('project_id'));
let device = null;
if (origCap) { try { device = JSON.parse(origCap.json); } catch(_){} }
const collectLen = (traffic.find(t=>t.what==='POST /collect')||{}).len || 0;
await step('ok','[+] /collect intercepted locally ('+collectLen+'B envelope · dd present, plaintext vessel');
await step('ok','[+] device_data captured pre-obfuscation: '+(device?Object.keys(device).length:0)+' fields, ORIGINAL keys');
await step('acc','[*] rendering payload + token + cipher panels …');

// ---- render ----
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let out = '';
if (preamble) {
  out += '<h2>TOKEN PREAMBLE — server-minted per bundle fetch (anti-replay state)</h2><div class="big">'+
    '<b>bundle_id</b> '+esc(preamble.bundle_id)+' · <b>backend</b> '+esc(preamble.backend)+'<br>'+
    '<b>generation</b> '+esc(preamble.generation)+' · <b>state</b> '+esc(preamble.state)+'<br>'+
    '<b>session_token</b> <span class="hex">'+esc(preamble.session_token)+'…</span> · <b>build_token</b> <span class="hex">'+esc(preamble.build_token)+'…</span>'+
    '</div>';
}
out += '<h2>TRAFFIC (intercepted locally, nothing forwarded)</h2><div class="big">'+
  traffic.map(t=>esc(t.what+(t.len?(' ('+t.len+'B)'):''))).join(' → ')+'</div>';
out += '<h2>dd CIPHER — recovered &amp; validated (100% byte match)</h2><div class="big">'+
  'dd = base64( <b>u[16]</b> ‖ ( rand16 ‖ QZ-renamed JSON ) ⊕ keystream(period 32) )<br>'+
  'keystream[s] = splitmix32(per-build seed)[s%32] ⊕ <b>u[s%16]</b> · the per-run key u is <b>prepended in cleartext</b> · QZ = 197-entry rename map<br>'+
  '<span class="dim">validated same-run: E⊕P periodic at offset 16 → 100% (see writeup §5).</span></div>';
out += '<h2>FULL READABLE PAYLOAD — '+ (device?Object.keys(device).length:0) +' fields, ORIGINAL KEYS (pre-obfuscation capture)</h2>';

const TELLS = ['bot_','worker_webdriver','cdp','cefsharp','dev_tools','hwid','incognito','spoof','tamper','proxy'];
const groupOf = k =>
  /^bot_/.test(k) ? 'BOT DETECTION' :
  /^worker_/.test(k) ? 'WORKER-REALM CROSS-CHECKS' :
  /^(gpu|webgpu|hwid)/.test(k) ? 'GPU / WEBGPU / HWID' :
  /^(font|css|emoji|math_|text_shaping|timing_precision|audio_)/.test(k) ? 'FINGERPRINTS' :
  /^(media_|drm_)/.test(k) ? 'MEDIA / DRM' :
  /^(sensor|hardware_|privacy_)/.test(k) ? 'SENSORS / ENV' :
  /^(device|browser_|screen_|touch_|engine|browser_id|collection_)/.test(k) ? 'DEVICE / BROWSER' : 'MISC';
if (device) {
  const groups = new Map();
  for (const [k,v] of Object.entries(device)) {
    const g = groupOf(k);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push([k,v]);
  }
  for (const [g, rows] of groups) {
    out += '<h3>'+esc(g)+' ('+rows.length+')</h3><table><tr><th>field</th><th>value</th></tr>';
    for (const [k,v] of rows) {
      const tell = TELLS.some(t=>k.includes(t));
      const vs = typeof v==='object' ? esc(JSON.stringify(v).slice(0,150)) : esc(String(v).slice(0,150));
      out += '<tr'+(tell?' class="tell"':'')+'><td class="k">'+esc(k)+'</td><td>'+vs+'</td></tr>';
    }
    out += '</table>';
  }
}
out += '<div class="big"><b>Takeaway:</b> the envelope is plaintext and dd decrypts with the bundle itself (key in the blob). '+
  'The server-minted session token is the only real anti-replay state — it never vouches for payload truthfulness.</div>';
await page.evaluate(h=>window.__render('out', h), out);
await step('dim','———— done · close the window to exit —————');

mkdirSync(join(repoRoot,'screenshots'),{recursive:true});
await sleep(1200);
await page.screenshot({ path: join(repoRoot,'screenshots','verisoul-full.png'), fullPage:true });
await page.screenshot({ path: join(repoRoot,'screenshots','verisoul-view.png') });
console.log('[+] screenshots saved: screenshots/verisoul-full.png, verisoul-view.png');
if (device) writeFileSync(join(repoRoot,'artifacts','device-data-capture.json'), JSON.stringify(device,null,2));
browser.on('disconnected', ()=> process.exit(0));
await new Promise(()=>{});
