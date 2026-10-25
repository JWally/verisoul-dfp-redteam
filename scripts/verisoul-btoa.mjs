#!/usr/bin/env node
/** verisoul-btoa.mjs — capture the RAW bytes that become the `dd` blob by
 *  hooking the base64 boundary + JSON.stringify (the collect object) at runtime. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { writeFileSync, mkdirSync } from 'node:fs';

const PORT = 8909;
const html = `<!doctype html><html><head>
<meta http-equiv="Content-Security-Policy" content="script-src 'unsafe-inline' https://*.verisoul.ai; worker-src 'self' blob: data:; connect-src 'self' https://*.verisoul.ai wss://*.verisoul.ai ws://127.0.0.1:* http://127.0.0.1:*;">
</head><body><script async src="https://js.verisoul.ai/sandbox/bundle.js" verisoul-project-id="probe-test-0000"></script></body></html>`;
const server = createServer((req,res)=>{ res.writeHead(200,{'content-type':'text/html'}); res.end(html); });
await new Promise(r=>server.listen(PORT,'127.0.0.1',r));

const INIT = `(() => {
  const W=window;
  W.__cap={ b64:[], strfy:[], enc:[] };
  const push=(arr,o,n=500)=>{ if(arr.length<n) arr.push(o); };
  const ob=W.btoa; W.btoa=function(s){
    try{ push(W.__cap.b64,{ len:String(s).length, sample:String(s).slice(0,200), tail:String(s).slice(-40) }); }catch(_){}
    return ob.call(this,s);
  };
  const oa=W.atob; W.atob=function(s){
    try{ const out=oa.call(this,s); if(String(s).length>1000) push(W.__cap.b64,{ op:'atob', inLen:String(s).length }); }catch(_){}
    return out;
  };
  const oS=JSON.stringify; W.JSON.stringify=function(v,r,sp){
    let out; try{ out=oS.call(this,v,r,sp); }catch(e){ out=oS.call(this,v); }
    try{
      if (typeof out==='string' && out.length>2000){
        const keys = v && typeof v==='object' && !Array.isArray(v) ? Object.keys(v) : null;
        if (keys && keys.some(k=>/collection|cl/it) ) push(W.__cap.strfy,{ len:out.length, keys:keys.slice(0,40) });
      }
    }catch(_){}
    return out;
  };
})();`;

const b = await chromium.launch({ headless:true });
const ctx = await b.newContext(); await ctx.addInitScript({content:INIT});
const page = await ctx.newPage();
const collects = [];
await page.route('**/collect', async route => {
  const pd = route.request().postData() || '';
  collects.push(pd);
  await route.fulfill({ status:200, contentType:'application/json', body:'{}' });
});
await page.route('**/refresh', r=>r.fulfill({ status:200, contentType:'application/json', body:'{}' }));
await page.route('**/cf-enrich*', r=>r.fulfill({ status:200, contentType:'application/json', body:'{}' }));

await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil:'load' });
await page.waitForTimeout(12000);
const cap = await page.evaluate(()=>window.__cap).catch(()=>null);
mkdirSync('/tmp/opencode/verisoul',{recursive:true});
// match dd: the collect body dd value length
if (collects.length){
  const ddLen = JSON.parse(collects[0]).dd.length;
  console.log('collect body dd base64 length:', ddLen, '(raw bytes ≈', Math.floor(ddLen*3/4), ')');
  // find btoa calls with input length matching (len*3/4 ~ 3138 -> input ~4184)
  const rawLen = Math.floor(ddLen*3/4);
  const cands = (cap?.b64||[]).filter(c=>c.len > rawLen-800 && c.len < rawLen+800);
  console.log('btoa candidates near rawLen (+800):', cands.length);
  for (const c of cands.slice(0,10)) console.log('  len', c.len, 'head:', JSON.stringify(c.sample.slice(0,80)), 'tail:', JSON.stringify(c.tail));
}
console.log('btoa call count:', cap?.b64?.length);
writeFileSync('/tmp/opencode/verisoul/verisoul-btoa.json', JSON.stringify({cap, collects},null,2));
await b.close(); server.close();
