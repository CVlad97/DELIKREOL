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
const orderId='11111111-1111-4111-8111-111111111111';
const token='abcdef0123456789';
const sampleOrder={id:orderId,order_number:'DK-TEST',customer_email:'test@example.invalid',customer_phone:'+596696000000',tracking_token:token,payment_status:'pending',payment_provider:null,payment_external_id:null,total_cents:1500,payment_currency:'EUR'};
function mockedFetch(order,remoteStatus='PAID',calls=[]){
 return async (url,opts={})=>{
 const method=opts.method||'GET';calls.push({url:String(url),method,body:opts.body?JSON.parse(opts.body):undefined});
 if(String(url).includes('/v0.1/checkouts/') && method==='GET')return Response.json({id:'mock-checkout',checkout_reference:'DK-DK-TEST',status:remoteStatus,amount:15,currency:'EUR'});
 if(String(url).endsWith('/v0.1/checkouts') && method==='POST')return Response.json({id:'mock-checkout',hosted_checkout_url:'https://checkout.example.invalid/mock',status:'PENDING'});
 if(String(url).includes('/rest/v1/orders?') && method==='GET')return Response.json([order]);
 if(String(url).includes('/rest/v1/external_payment_events?') && method==='GET')return Response.json([]);
 if(String(url).includes('/rest/v1/') && ['PATCH','POST'].includes(method))return new Response(null,{status:204});
 throw Error('unexpected mock URL '+url);
 };
}
test('mock checkout creates pending payment without network',async()=>{
 const h=await load('create-sumup-checkout');const calls=[];globalThis.fetch=mockedFetch(sampleOrder,'PAID',calls);
 const r=await h(req('POST',{order_id:orderId,tracking_token:token,email:sampleOrder.customer_email,phone:sampleOrder.customer_phone}));
 assert.equal(r.status,200);assert.equal((await r.json()).checkout_id,'mock-checkout');
 assert.equal(calls.filter(c=>c.url.endsWith('/v0.1/checkouts')).length,1);
 assert.equal(calls.find(c=>c.method==='PATCH').body.payment_status,'processing');
});
test('mock paid webhook updates order after SumUp verification',async()=>{
 const h=await load('sumup-webhook');const calls=[];globalThis.fetch=mockedFetch({...sampleOrder,payment_status:'processing',payment_provider:'sumup',payment_external_id:'mock-checkout',payment_reference:'DK-DK-TEST'},'PAID',calls);
 const r=await h(req('POST',{checkout_id:'mock-checkout'}));assert.equal(r.status,200);assert.equal((await r.json()).payment_status,'paid');
 assert.equal(calls.find(c=>c.method==='PATCH').body.payment_status,'paid');
});
test('mock refunded webhook updates previously paid order',async()=>{
 const h=await load('sumup-webhook');const calls=[];globalThis.fetch=mockedFetch({...sampleOrder,payment_status:'paid',payment_provider:'sumup',payment_external_id:'mock-checkout',payment_reference:'DK-DK-TEST'},'REFUNDED',calls);
 const r=await h(req('POST',{checkout_id:'mock-checkout'}));assert.equal(r.status,200);assert.equal((await r.json()).payment_status,'refunded');
});
test('mock amount mismatch blocks webhook without DB write',async()=>{
 const h=await load('sumup-webhook');const calls=[];globalThis.fetch=mockedFetch({...sampleOrder,payment_status:'processing',payment_provider:'sumup',payment_external_id:'mock-checkout',payment_reference:'DK-DK-TEST',total_cents:1600},'PAID',calls);
 const r=await h(req('POST',{checkout_id:'mock-checkout'}));assert.equal(r.status,409);assert.equal(calls.filter(c=>c.method==='PATCH').length,0);
});
test('mock paid webhook is idempotent for paid status',async()=>{
 const h=await load('sumup-webhook');const calls=[];globalThis.fetch=mockedFetch({...sampleOrder,payment_status:'paid',payment_provider:'sumup',payment_external_id:'mock-checkout',payment_reference:'DK-DK-TEST'},'PAID',calls);
 const r=await h(req('POST',{checkout_id:'mock-checkout'}));assert.equal(r.status,200);assert.equal((await r.json()).payment_status,'paid');assert.equal(calls.find(c=>c.method==='PATCH').body.paid_at,undefined);
});
