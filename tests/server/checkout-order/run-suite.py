# Suite reproductible : checkout-order (Deno local) + mock PostgREST local. Aucun appel externe.
import json, subprocess, sys, pathlib, uuid
BASE = 'http://127.0.0.1:8000/'
import os
WRITES = pathlib.Path(os.environ.get("WRITES_FILE", "/tmp/writes.jsonl"))
PID = '11111111-1111-4111-8111-111111111111'
import urllib.request, urllib.error
def post(body):
    req = urllib.request.Request(BASE, data=json.dumps(body).encode(), headers={'Content-Type':'application/json'}, method='POST')
    try:
        response = urllib.request.urlopen(req, timeout=30)
    except urllib.error.HTTPError as exc:
        response = exc
    with response:
        code = response.status
        raw = response.read().decode('utf-8')
    return code, json.loads(raw)
def writes():
    return len([l for l in WRITES.read_text().splitlines() if l.strip()]) if WRITES.exists() else 0
def body(provider, key):
    return {'idempotency_key': key, 'items': [{'product_id': PID, 'quantity': 1}], 'delivery_mode': 'retrait',
            'payment_provider': provider, 'phone': '+596696000000', 'customer_name': 'Test local'}
results = []
def check(name, ok, detail=''):
    results.append((name, ok))
    print(('PASS ' if ok else 'FAIL ') + name + ('  ' + detail if detail else ''))
run = uuid.uuid4().hex[:12]
w0 = writes()
code, d = post(body('cash_on_delivery', 'cod-' + run + '-0001'))
check('cash_on_delivery refuse HTTP 400', code == 400, f'http={code}')
check('cash_on_delivery motif payment_provider non autorise', d.get('error') == 'payment_provider non autorisé', json.dumps(d)[:160])
check('cash_on_delivery sans ecriture', writes() == w0, f'writes_before={w0} after={writes()}')
w1 = writes()
code, d = post(body('qonto_transfer', 'qonto-' + run + '-0001'))
check('qonto_transfer accepte HTTP 200', code == 200, f'http={code}')
check('qonto_transfer commande pending', (d.get('order') or {}).get('payment_status') == 'pending', json.dumps(d.get('order'))[:160])
check('qonto_transfer une ecriture', writes() == w1 + 1, f'delta={writes() - w1}')
w2 = writes()
code, d2 = post(body('qonto_transfer', 'qonto-' + run + '-0001'))
check('requete dupliquee idempotente (existing=true)', code == 200 and d2.get('existing') is True, f'http={code} existing={d2.get("existing")}')
check('requete dupliquee sans nouvelle ecriture', writes() == w2, f'delta={writes() - w2}')
w3 = writes()
code, d = post(body('bitcoin_inconnu', 'unk-' + run + '-0001'))
check('moyen inconnu refuse HTTP 400', code == 400, f'http={code}')
check('moyen inconnu sans ecriture', writes() == w3, f'delta={writes() - w3}')
unexpected = [l for l in WRITES.read_text().splitlines() if 'unexpected_write' in l]
check('aucune ecriture inattendue (non-RPC)', not unexpected, f'count={len(unexpected)}')
ok = all(r for _, r in results)
print(f'SUMMARY {sum(1 for _, r in results if r)}/{len(results)} passed')
sys.exit(0 if ok else 1)
