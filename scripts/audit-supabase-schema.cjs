#!/usr/bin/env python3
"""Supabase schema auditor for DELIKREOL"""
import subprocess, json, sys, os

# Get access token
with open(os.path.expanduser('~/.supabase/access-token')) as f:
    access_token = f.read().strip()

# Get service role key
cmd = f"curl -s -X GET 'https://api.supabase.com/v1/projects/boihlgodmclljtckhmgz/api-keys' -H 'Authorization: Bearer {access_token}'"
result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=15)
keys = json.loads(result.stdout)
service_key = [k['api_key'] for k in keys if k['name'] == 'service_role'][0]

# Headers for requests
headers = f"-H 'apikey: {service_key}' -H 'Authorization: Bearer {service_key}' -H 'Accept: application/json'"

def rest_get(path):
    """Make REST API GET request"""
    cmd = f"curl -s 'https://boihlgodmclljtckhmgz.supabase.co/rest/v1/{path}' {headers}"
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=15)
    try:
        return json.loads(r.stdout)
    except:
        return r.stdout

def rest_post(path, data):
    """Make REST API POST request"""
    cmd = f"curl -s -X POST 'https://boihlgodmclljtckhmgz.supabase.co/rest/v1/{path}' {headers} -H 'Content-Type: application/json' -d '{json.dumps(data)}'"
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=15)
    return r.stdout

# Get schema info via pg_catalog tables accessible via REST
# Try querying specific tables
tables_to_check = [
    'vendors', 'products', 'orders', 'order_items', 'profiles',
    'partner_applications', 'partner_documents', 'contact_messages',
    'reviews', 'relay_points', 'drivers', 'client_requests',
    'feedback', 'admin_users', 'admin_settings', 'delivery_rules',
    'project_memory', 'loyalty_points', 'loyalty_events',
    'payouts', 'stripe_webhook_events', 'notifications',
    'order_events', 'delivery_communications', 'driver_applications',
    'partner_scores', 'partner_correction_requests',
    'partner_access_tokens', 'media_assets', 'actions',
    'ai_config', 'audit_logs', 'auto_trade_config',
    'followed_wallets', 'managed_wallets', 'portfolio_snapshots',
    'settings', 'signals', 'transactions', 'wallet_balances',
    'delivery_missions', 'deliveries', 'partner_invites',
    'site_events', 'dashboard_alerts'
]

print("=== TABLES FOUND ===")
for table in tables_to_check:
    # Try to get count
    data = rest_get(f"{table}?select=count")
    if isinstance(data, list):
        print(f"  ✅ {table}: {len(data)} rows (query returned list)")
    elif isinstance(data, dict) and 'code' not in data:
        print(f"  ⚠️  {table}: {str(data)[:80]}")
    elif isinstance(data, dict):
        if 'code' in data:
            print(f"  ❌ {table}: {data.get('message','?')[:60]}")
        else:
            print(f"  ✅ {table}: (dict response) {str(data)[:60]}")
    else:
        print(f"  ❓ {table}: {str(data)[:60]}")