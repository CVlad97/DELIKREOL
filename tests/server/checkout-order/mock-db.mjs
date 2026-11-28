// Mock local PostgREST/RPC pour checkout-order. Aucun identifiant reel, aucun appel reseau externe.
import http from 'node:http';
import fs from 'node:fs';
const LOG = process.env.WRITE_LOG || '/tmp/writes.jsonl';
const PRODUCT = { id: '11111111-1111-4111-8111-111111111111', vendor_id: 'v1', name: 'Produit test', price: 10, is_available: true, is_public: true, is_demo: false, status: 'verified', menu_options: null, vendors: { id: 'v1', business_name: 'Vendeur test', name: 'Vendeur test', phone: null, commission_rate: 10, status: 'verified', is_active: true, is_public: true, is_demo: false } };
const orders = new Map();
let seq = 0;
function logWrite(kind, data) { fs.appendFileSync(LOG, JSON.stringify({ t: Date.now(), kind, data }) + String.fromCharCode(10)); }
http.createServer((req, res) => {
  let b = '';
  req.on('data', (c) => (b += c));
  req.on('end', () => {
    res.setHeader('Content-Type', 'application/json');
    const u = new URL(req.url, 'http://mock');
    const p = u.pathname;
    if (req.method === 'GET' && p === '/rest/v1/products') return res.end(JSON.stringify([PRODUCT]));
    if (req.method === 'GET' && p === '/rest/v1/orders') {
      const key = (u.searchParams.get('idempotency_key') || '').replace(/^eq\./, '');
      const row = orders.get(key);
      return res.end(JSON.stringify(row ? [row] : []));
    }
    if (req.method === 'POST' && p === '/rest/v1/rpc/consume_checkout_rate_limit') return res.end('0');
    if (req.method === 'POST' && p === '/rest/v1/rpc/create_checkout_order_atomic') {
      const args = JSON.parse(b || '{}');
      const key = args.target_idempotency_key;
      if (orders.has(key)) return res.end(JSON.stringify({ order: orders.get(key), existing: true }));
      seq += 1;
      const o = { id: 'mock-' + seq, order_number: args.order_payload.order_number, payment_status: args.order_payload.payment_status, payment_provider: args.order_payload.payment_provider };
      orders.set(key, o);
      logWrite('rpc_create_order', { key, provider: o.payment_provider, payment_status: o.payment_status });
      return res.end(JSON.stringify({ order: o, existing: false }));
    }
    if (req.method !== 'GET') logWrite('unexpected_write', { method: req.method, path: p });
    res.statusCode = 404;
    res.end('{"message":"mock: not found"}');
  });
}).listen(18999, '127.0.0.1', () => console.log('mock ready 127.0.0.1:18999'));
