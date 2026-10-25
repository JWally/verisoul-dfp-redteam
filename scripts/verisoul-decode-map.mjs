#!/usr/bin/env node
/** verisoul-decode-map.mjs — patch the live bundle's string decoder BY STRUCTURE
 *  (regex on the atob+TextDecoder trace) to capture every (index -> string) decode
 *  at runtime — immune to per-delivery identifier rotation. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const PORT = 8913;
const html = `<!doctype html><html><head>
<meta http-equiv="Content-Security-Policy" content="script-src 'unsafe-inline' https://*.verisoul.ai; worker-src 'self' blob: data:; connect-src 'self' https://*.verisoul.ai wss://*.verisoul.ai ws://127.0.0.1:* http://127.0.0.1:*;">
</head><body><script async src="https://js.verisoul.ai/sandbox/bundle.js" verisoul-project-id="probe-test-0000"></script></body></html>`;
const server = createServer((req,res)=>{ res.writeHead(200,{'content-type':'text/html'}); res.end(html); });
await new Promise(r=>server.listen(PORT,'127.0.0.1',r));

const b = await chromium.launch({ headless:true });
const ctx = await b.newContext();
await ctx.addInitScript(()=>{
  const oS = JSON.stringify;
  JSON.stringify = function(v, r, sp){
    let out;
    try { out = oS.call(this, v, r, sp); } catch(e) { try { out = oS.call(this, v); } catch(e2){ return undefined; } }
    try {
      if (typeof out === 'string' && out.length > 1500 && v && typeof v === 'object' && !Array.isArray(v)) {
        window.__vsJson = window.__vsJson || [];
        if (window.__vsJson.length < 60) window.__vsJson.push({ len: out.length, keys: Object.keys(v).slice(0,200), json: out });
      }
    } catch(_) {}
    return out;
  };
});
const page = await ctx.newPage();
const collects = [];

await page.route('**/bundle.js*', async route => {
  const resp = await route.fetch();
  let body = await resp.text();
  // structural patch: capture (index, string) right before the memo store
  const re = /(var \w+=new TextDecoder\(\)\.decode\([A-Za-z_$][\w$]*\);)([A-Za-z_$][\w$]*)\[([A-Za-z_$][\w$]*)\]=([A-Za-z_$][\w$]*);return \4;/;
  const m = body.match(re);
  if (m) {
    const hook = `${m[1]}try{window.__vsD=window.__vsD||[],window.__vsD.length<20000&&window.__vsD.push([${m[3]},${m[4]}])}catch(_){};try{if([815,816,811,818,712,709,706,760,757,15,16,17].indexOf(${m[3]})>=0){var __st=(new Error()).stack;window.__vsSt=window.__vsSt||[];window.__vsSt.length<200&&window.__vsSt.push([${m[3]},${m[4]},__st])}}catch(_2){};${m[2]}[${m[3]}]=${m[4]};return ${m[4]};`;
    body = body.replace(m[0], hook);
  } else {
    console.log('[!] structural regex did NOT match — decoder shape changed');
  }
  // ---- ALSO hook cR (the dd encoder): capture its input (readable device_data) ----
  const cRre = /function ([A-Za-z_$][\w$]*)\((\w+)\)\{((?:(?!function)[\s\S])*?)Symbol([\s\S]*?)new TextEncoder\(\)/;
  const cm2 = body.match(cRre);
  if (cm2) {
    const inject = `function ${cm2[1]}(${cm2[2]}){try{window.__cRIn=window.__cRIn||[],window.__cRIn.length<50&&window.__cRIn.push(${cm2[2]})}catch(_){}${cm2[3]}Symbol${cm2[4]}new TextEncoder()`;
    body = body.replace(cm2[0], inject);
    console.log('[+] cR encoder hooked (input capture): '+cm2[1]);
  } else {
    console.log('[!] cR structural regex did NOT match');
  }
  writeFileSync('/tmp/opencode/verisoul/bundle-served.js', body);
  console.log('[+] decoder patched (struct regex matched)');
  await route.fulfill({ status:200, contentType:'application/javascript', body });
});
await page.route('**/collect', async route => {
  collects.push(route.request().postData() || '');
  await route.fulfill({ status:200, contentType:'application/json', body:'{}' });
});
await page.route('**/refresh', r=>r.fulfill({ status:200, contentType:'application/json', body:'{}' }));
await page.route('**/cf-enrich*', r=>r.fulfill({ status:200, contentType:'application/json', body:'{}' }));

// --- same-run decrypt constants (extracted from the served build) ---
let MA=32, XD=16, LK=16, PG=380368963;
let servedSrc = '';
{
  const served = readFileSync('/tmp/opencode/verisoul/bundle-served.js','utf8');
  servedSrc = served;
  const cm = served.match(/const mA=(\d+);const xD=(\d+);const lk=(\d+);let pg=(-?\d+);/);
  if (cm) { MA=+cm[1]; XD=+cm[2]; LK=+cm[3]; PG=+cm[4]; console.log('[+] same-run constants: mA='+MA+' xD='+XD+' lk='+LK+' pg='+PG); }
  else console.log('[!] constants regex did not match served bundle');
}
function qx(seed,len){const key=new Uint8Array(len);let s=seed>>>0;for(let i=0;i<len;i++){s=(s+2654435769)>>>0;let z=s;z=Math.imul(z^z>>>16,2246822507)>>>0;z=Math.imul(z^z>>>13,3266489909)>>>0;z=(z^z>>>16)>>>0;key[i]=z&255;}return key;}
function decryptDD(ddB64){
  const K=Buffer.from(ddB64,'base64');
  const u=K.subarray(0,XD), E=K.subarray(XD);
  const q=qx(PG,MA);
  const i=new Uint8Array(MA); for(let s=0;s<MA;s++) i[s]=q[s]^u[s%XD];
  const P=Buffer.alloc(E.length);
  for(let s=0;s<E.length;s++) P[s]=E[s]^i[s%MA];
  return P.subarray(LK).toString('utf8');
}

await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil:'load' });
// wait for decodes to accumulate
await page.waitForFunction(()=>window.__vsD && window.__vsD.length>100, { timeout:30000 }).catch(()=>{});
await page.waitForTimeout(3000);
const decodes = await page.evaluate(()=>window.__vsD||[]).catch(()=>[]);
const stacks = await page.evaluate(()=>window.__vsSt||[]).catch(()=>[]);
const cRInputs = await page.evaluate(()=>window.__cRIn||[]).catch(()=>[]);
const jsonCaps = await page.evaluate(()=>window.__vsJson||[]).catch(()=>[]);
writeFileSync('/tmp/opencode/verisoul/cr-inputs.json', JSON.stringify(cRInputs,null,2));
writeFileSync('/tmp/opencode/verisoul/json-caps.json', JSON.stringify(jsonCaps,null,2));
console.log('cR input captures:', cRInputs.length);
console.log('large JSON.stringify captures:', jsonCaps.length);
for (const c of jsonCaps.slice(0,3)) {
  console.log('--- JSON cap len='+c.len+' keys='+c.keys.length+': '+c.json.slice(0,200));
}
mkdirSync('/tmp/opencode/verisoul',{recursive:true});
writeFileSync('/tmp/opencode/verisoul/decode-map.json', JSON.stringify(decodes,null,2));
writeFileSync('/tmp/opencode/verisoul/decode-stacks.json', JSON.stringify(stacks,null,2));
// --- decrypt dd from THIS run with THIS build's constants ---
if (collects.length) {
  const uniq2 = new Map(decodes.filter(d=>typeof d[0]==='number'&&typeof d[1]==='string').map(d=>[d[0],d[1]]));
  const qzSrc = servedSrc;
  const qzMatch = qzSrc.match(/QZ=\{[^}]*\}/);
  const shortToLong = {};
  if (qzMatch) {
    for (const m of qzMatch[0].matchAll(/\[(?:\w+)\((\d+)\)\]:\s*"([A-Za-z0-9_]+)"/g)) {
      shortToLong[m[2]] = uniq2.get(parseInt(m[1])) || m[1];
    }
  }
  const decrypted = [];
  for (const pd of collects) {
    try {
      const j = JSON.parse(pd);
      if (!j.dd) continue;
      const body = decryptDD(j.dd);
      const obj = JSON.parse(body);
      const pretty = {};
      for (const [k,v] of Object.entries(obj)) pretty[shortToLong[k] || k] = v;
      decrypted.push(pretty);
    } catch (e) { decrypted.push({ err:String(e).slice(0,120) }); }
  }
  writeFileSync('/tmp/opencode/verisoul/dd-decrypted-samerrun.json', JSON.stringify(decrypted,null,2));
  writeFileSync('/tmp/opencode/verisoul/collects-samerrun.json', JSON.stringify(collects,null,2));
  console.log('dd decrypted (same-run):', decrypted.length);
  const first = decrypted[0];
  if (first && !first.err) {
    console.log('top-level keys:', Object.keys(first).length);
    for (const [k,v] of Object.entries(first)) {
      const vs = typeof v==='object' ? JSON.stringify(v).slice(0,100) : String(v).slice(0,100);
      console.log(`  ${String(k).padEnd(32)} ${vs}`);
    }
  } else console.log('decrypt result:', JSON.stringify(first||null).slice(0,200));
}
console.log('stacks captured:', stacks.length);
for (const [i,str,st] of (stacks||[]).slice(0,6)) console.log('  idx'+i+' ('+str+'):', (st||'').split('\n').slice(1,4).join(' | '));
console.log('runtime decodes captured:', decodes.length);
const uniq = new Map();
for (const [i,s] of decodes) if (typeof i==='number' && typeof s==='string' && !uniq.has(i)) uniq.set(i,s);
console.log('unique indices:', uniq.size);
// key strings
for (const w of ['dd','obf_id','ice_candidates','token_generation','session_token','build_token','stun','collect','refresh','payload','encode','decode','frontiers','xor','encrypt','obfuscate','serialize','device_signals','fingerprint']){
  const hit = [...uniq.entries()].find(([i,s])=>s===w);
  console.log(`${w}: ${hit ? 'idx='+hit[0] : '—'}`);
}
writeFileSync('/tmp/opencode/verisoul/decode-map-uniq.json', JSON.stringify([...uniq.entries()],null,2));
await b.close(); server.close();
