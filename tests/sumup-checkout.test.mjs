import assert from 'node:assert/strict';
let handler, captured;
globalThis.Deno={env:{get:k=>({SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEYS:'{"payments":"fake-test-only"}',SUMUP_API_KEY:'fake-test-only',SUMUP_MERCHANT_CODE:'TEST',SUMUP_ENV:'sandbox'})[k]},serve:h=>handler=h};
const order={id:'11111111-1111-4111-8111-111111111111',order_number:'TEST',customer_email:'test@example.invalid',customer_phone:'+596696000000',tracking_token:'0123456789abcdef',payment_status:'pending',total_cents:100,payment_currency:'EUR'};
globalThis.fetch=async(url,opts={})=>{
 if(String(url).includes('api.sumup.com')){captured=JSON.parse(opts.body);return Response.json({id:'test-checkout',hosted_checkout_url:'https://checkout.sumup.com/test',status:'PENDING'});}
 return Response.json(opts.method==='PATCH'||opts.method==='POST'?null:[order]);
};
await import('../supabase/functions/create-sumup-checkout/index.ts');
const request=(body,origin='https://delikreol.com')=>new Request('https://example.invalid',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
const body={order_id:order.id,tracking_token:order.tracking_token,email:order.customer_email,phone:order.customer_phone};
assert.equal((await handler(request(body))).status,200);
assert.equal(captured.return_url,'https://example.supabase.co/functions/v1/sumup-webhook');
assert.equal(captured.redirect_url,'https://delikreol.com/statut-commande?order=0123456789abcdef');
assert.equal(captured.amount,1);
assert.equal((await handler(request({...body,tracking_token:'ffffffffffffffff'}))).status,403);
assert.equal((await handler(request(body,'https://evil.invalid'))).status,403);
assert.equal((await handler(request({...body,order_id:'invalid'}))).status,400);
console.log('PASS: callback, redirect, server amount, token, origin, invalid ID');
