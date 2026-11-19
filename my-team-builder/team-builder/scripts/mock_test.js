const fs=require('fs');const D=process.argv[2]||"";
const docs={};if(D)for(const f of fs.readdirSync(D).filter(f=>!f.startsWith('.'))){const j=JSON.parse(fs.readFileSync(D+'/'+f));docs['data/users/U/'+f.replace('.json','')]=j.data||j;}
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:800}});
const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>logs.push(m.type()+' '+m.text()));
await p.exposeFunction('__docs',()=>docs);
await p.addInitScript(()=>{ 'use strict';
 let store=null; const ready=window.__docs().then(d=>store=d);
 const snap=(path)=>({id:path.split('/').pop(),exists:!!store[path],data:()=>{const f=o=>{if(o&&typeof o==='object'){Object.freeze(o);Object.values(o).forEach(f)}return o};return f(JSON.parse(JSON.stringify(store[path])))}});
 const db={doc:(path)=>{ if(path.split('/').length%2) throw new TypeError('bad doc path '+path); return {get:async()=>{await ready;return snap(path)},set:async(d)=>{store[path]=JSON.parse(JSON.stringify(d))},delete:async()=>{delete store[path]}} },
   collection:(c)=>({onSnapshot:(cb)=>{setTimeout(()=>cb({docs:[]}),50);return()=>{}},get:async()=>({docs:[]}),doc:(id)=>db.doc(c+'/'+id)})};
 const sample=async(input,opts)=>{ window.__lastInput=input; window.__lastOpts=opts; const len=JSON.stringify(input).length; if(new Blob([JSON.stringify(input)]).size>262144) throw {code:'prompt_too_large'}; opts&&opts.onText&&opts.onText({text:'תשובה לדוגמה',delta:''}); return {text:'תשובה לדוגמה ('+len+' תווים)'} };
 sample.json=async()=>({replies:[{id:'manager',text:'שלום'}]}); sample.limits=async()=>({maxPromptBytes:262144});
 window.claude={use:async(n)=>({sample, db, user:{id:async()=>'U',can:async()=>true}}[n]||null)};
});
await p.goto('http://127.0.0.1:8765/local.html');await p.waitForTimeout(800);
for(const who of JSON.parse(process.env.IDS||'["marketing","manager"]')){
 await p.evaluate(()=>{});await p.click(`.m[data-id="${who}"], .lead-card[data-id="${who}"]`);await p.waitForTimeout(500);
 await p.fill('#input','בדיקה');await p.click('#send');await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>({busy, last:[...document.querySelectorAll('.bubble')].slice(-1)[0]?.textContent.slice(0,60), note:[...document.querySelectorAll('.note')].map(n=>n.textContent).join('|')}));
 console.log(who,JSON.stringify(r)); await p.click('#back');await p.waitForTimeout(300);}
console.log(logs.filter(l=>!l.includes('favicon')).slice(0,10));await b.close()})();
