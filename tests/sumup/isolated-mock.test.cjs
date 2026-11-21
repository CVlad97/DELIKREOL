const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
async function load(slug){
 globalThis.Deno={env:{get:k=>({SUPABASE_URL:'https://isolated.invalid',SUPABASE_SECRET_KEYS:'{"payments":"fake"}',SUMUP_API_KEY:'fake',SUMUP_MERCHANT_CODE:'fake',SUMUP_ENV:'sandbox'})[k]},serve:fn=>{globalThis.handler=fn}};
 globalThis.fetch=()=>{throw Error('unexpected external network')};
 const src=fs.readFileSync('supabase/functions/'+slug+'/index.ts','utf8');
 const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64')+'#'+Math.random());
 return globalThis.handler;
}
const req=(method,body,origin)=>new Request('https://isolated.invalid',{method,headers:{'content-type':'application/json',...(origin?{origin}:{})},body:body===undefined?undefined:JSON.stringify(body)});
test('checkout rejects GET',async()=>{const h=await load('create-sumup-checkout');assert.equal((await h(req('GET'))).status,405)});
test('checkout rejects foreign origin',async()=>{const h=await load('create-sumup-checkout');assert.equal((await h(req('POST',{},'https://attacker.invalid'))).status,403)});
test('checkout rejects invalid order id',async()=>{const h=await load('create-sumup-checkout');assert.equal((await h(req('POST',{order_id:'invalid'}))).status,400)});
test('checkout rejects invalid tracking token',async()=>{const h=await load('create-sumup-checkout');assert.equal((await h(req('POST',{order_id:'11111111-1111-4111-8111-111111111111',tracking_token:'bad'}))).status,403)});
test('webhook rejects GET',async()=>{const h=await load('sumup-webhook');assert.equal((await h(req('GET'))).status,405)});
test('webhook missing id does not process',async()=>{const h=await load('sumup-webhook');const r=await h(req('POST',{}));assert.equal(r.status,200);assert.equal((await r.json()).processed,false)});
test('webhook rejects oversized id',async()=>{const h=await load('sumup-webhook');assert.equal((await h(req('POST',{checkout_id:'x'.repeat(201)}))).status,400)});
