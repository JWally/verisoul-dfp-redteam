#!/usr/bin/env node
/** verisoul-q1t.mjs — hook the Q1T string-table decoder in bundle.js to dump the
 *  (index -> decoded string) schema, and capture the /collect payload again. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { writeFileSync, mkdirSync } from 'node:fs';

const PORT = 8907;
const html = `<!doctype html><html><head>
<meta http-equiv="Content-Security-Policy" content="script-src 'unsafe-inline' https://*.verisoul.ai; worker-src 'self' blob: data:; connect-src 'self' https://*.verisoul.ai wss://*.verisoul.ai ws://127.0.0.1:* http://127.0.0.1:*;">
</head><body><script async src="https://js.verisoul.ai/sandbox/bundle.js" verisoul-project-id="probe-test-0000"></script></body></html>`;
const server = createServer((req,res)=>{ res.writeHead(200,{'content-type':'text/html'}); res.end(html); });
await new Promise(r=>server.listen(PORT,'127.0.0.1',r));

const b = await chromium.launch({ headless:true });
const ctx = await b.newContext();
const page = await ctx.newPage();
const collects = [];

await page.route('**/bundle.js*', async route => {
  const resp = await route.fetch();
  let body = await resp.text();
  // wrap Q1T to log (index -> decoded)
  const needle = 'Q1T=(p)=>VT(p,0,0)';
  const wrap = `Q1T=(p)=>{const __r=VT(p,0,0);try{(window.__q1t=window.__q1t||[]).length<6000&&window.__q1t.push([p,__r]);}catch(_){}return __r;}`;
  if (body.includes(needle)) body = body.replace(needle, wrap);
  else console.log('[!] Q1T anchor not found in served bundle');
  await route.fulfill({ status:200, contentType:'application/javascript', body });
});
await page.route('**/collect', async route => {
  collects.push(route.request().postData() || '');
  // fulfill with something that looks plausible so the SDK proceeds
  await route.fulfill({ status:200, contentType:'application/json', body:'{}' });
});
await page.route('**/refresh', r=>r.fulfill({ status:200, contentType:'application/json', body:'{}' }));
await page.route('**/cf-enrich*', r=>r.fulfill({ status:200, contentType:'application/json', body:'{}' }));

await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil:'load' });
await page.waitForTimeout(12000);
const q1t = await page.evaluate(()=>window.__q1t||[]).catch(()=>[]);
mkdirSync('/tmp/opencode/verisoul',{recursive:true});
writeFileSync('/tmp/opencode/verisoul/q1t-log.json', JSON.stringify(q1t,null,2));
writeFileSync('/tmp/opencode/verisoul/collects-q1t.json', JSON.stringify(collects,null,2));
console.log('Q1T decodes captured:', q1t.length);
const uniq = new Map();
for (const [i,s] of q1t) if (!uniq.has(i)) uniq.set(i,s);
console.log('unique indices:', uniq.size);
// find interesting decodes
const interesting = [...uniq.entries()].filter(([i,s])=>
  /collect|dd|obf|stun|encrypt|xor|base64|session|candidate|cf-|bhve|ws:/i.test(s)).slice(0,60);
console.log('\n=== interesting decodes ===');
for (const [i,s] of interesting) console.log(`  [${i}] ${JSON.stringify(s)}`);
// find all strings that look like endpoint paths
console.log('\n=== endpoint-like strings ===');
for (const [i,s] of uniq) if (/^\/[a-z]|https?:|wss?:/.test(s)) console.log(`  [${i}] ${JSON.stringify(s)}`);
await b.close(); server.close();
