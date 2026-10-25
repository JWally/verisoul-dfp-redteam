#!/usr/bin/env node
/**
 * verisoul-probe.mjs — load the real Verisoul sandbox bundle on a local page,
 * intercept ALL traffic + native API hooks, and capture what the SDK ships.
 * Telemetry is fulfilled locally / logged, never forwarded.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { writeFileSync, mkdirSync } from 'node:fs';

const PORT = 8905;
const html = `<!doctype html><html><head>
<meta http-equiv="Content-Security-Policy" content="script-src 'unsafe-inline' https://*.verisoul.ai; worker-src 'self' blob: data:; connect-src 'self' https://*.verisoul.ai wss://*.verisoul.ai ws://127.0.0.1:* http://127.0.0.1:*;">
</head><body><h1>verisoul probe</h1>
<script>
window.__vs_ready=(v)=>{ window.__V={...v}; window.__vsHas=!!v; };
window.addEventListener('VerisoulReady',(e)=>{ try{ window.__V={session:e.detail.session, sid:e.detail.session&&e.detail.session.session_id}; window.__vsHas=true; }catch(_){} });
</script>
<script async src="https://js.verisoul.ai/sandbox/bundle.js" verisoul-project-id="probe-test-0000" data-verisoul="probe"></script>
<button id="go" onclick="(async()=>{try{const r=await window.Verisoul.session();window.__sid=r&&r.session_id;window.__sessionRes='ok';}catch(e){window.__sessionRes='ERR:'+String(e).slice(0,200);}})()">session()</button>
</body></html>`;

const server = createServer((req,res)=>{
  if (req.url === '/') { res.writeHead(200,{'content-type':'text/html'}); res.end(html); }
  else { res.writeHead(200,{'content-type':'text/plain'}); res.end('ok'); }
});
await new Promise(r=>server.listen(PORT,'127.0.0.1',r));

const b = await chromium.launch({ headless:true });
const ctx = await b.newContext();
const page = await ctx.newPage();
const net = [];
const bodyDumps = [];

// capture every request body (regardless of destination)
page.on('request', async req => {
  const u = req.url();
  if (/js\.verisoul\.ai|verisoul|gnet/.test(u) || req.method() !== 'GET') {
    const pd = req.postData() || null;
    const rec = { t: Date.now(), method: req.method(), url: u.slice(0,220), bodyLen: pd ? pd.length : 0 };
    if (pd) { rec.body = pd.slice(0, 6000); bodyDumps.push(rec); }
    net.push(rec);
  }
});
page.on('response', async r => {
  if (/gnet|signals|events/.test(r.url())) {
    let txt=null; try { txt = await r.text(); } catch(_){}
    net.push({ t: Date.now(), resp: 'GET?POST', url: r.url().slice(0,220), status: r.status(), body: txt ? txt.slice(0,2000) : null });
  }
});
page.on('requestfailed', req => { net.push({ t: Date.now(), failed: req.url().slice(0,160), err: String(req.failure()||'').slice(0,120) }); });
page.on('console', m => { if (m.type()==='error'||m.type()==='warning') net.push({ t: Date.now(), console: m.type()+': '+m.text().slice(0,300) }); });
page.on('pageerror', e => net.push({ t: Date.now(), pageerror: String(e).slice(0,300) }));

await page.route('**/*', async route => {
  const url = route.request().url();
  // fulfill everything verisoul-related locally so nothing leaves the box
  if (/js\.verisoul\.ai/.test(url) && url.endsWith('bundle.js')) return route.continue();
  if (/verisoul|gnet/.test(url)) {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, local: true }) });
  } else route.continue();
});

await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil:'load' });
await page.waitForTimeout(6000);
console.log('Verisoul typeof:', await page.evaluate(()=>typeof window.Verisoul));
console.log('bundle_id:', await page.evaluate(()=>window.__vs_bundle_id||null));
console.log('preamble state:', await page.evaluate(()=>window.__vs_token_preamble && window.__vs_token_preamble.state));
// trigger session()
await page.click('#go');
await page.waitForTimeout(8000);
const res = await page.evaluate(()=>({ sid: window.__sid||null, sessionRes: window.__sessionRes||null, vsHas: window.__vsHas||false })).catch(()=>null);
console.log('session():', JSON.stringify(res));

mkdirSync('/tmp/opencode/verisoul',{recursive:true});
writeFileSync('/tmp/opencode/verisoul/probe-net.json', JSON.stringify(net,null,2));
writeFileSync('/tmp/opencode/verisoul/probe-bodies.json', JSON.stringify(bodyDumps,null,2));
console.log('\n=== network events ('+net.length+') ===');
for (const n of net.slice(0,40)) console.log(' ', n.method||n.resp||'', n.url||'', n.status||'', typeof n.body==='string'?('body('+n.body.length+'): '+n.body.slice(0,150)):'', n.failed||n.pageerror||n.console||'');
console.log('\n=== POST bodies ('+bodyDumps.length+') ===');
for (const d of bodyDumps.slice(0,5)) console.log(' ', d.method, d.url, '->', String(d.body).slice(0,400));
await b.close(); server.close();
