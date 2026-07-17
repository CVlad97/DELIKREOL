#!/usr/bin/env python3
"""Query Supabase schema via Management API SQL endpoint"""
import subprocess, json, os, sys

with open('/tmp/supa_token.txt') as f:
    token = f.read().strip()

# Use Management API to execute SQL query
# POST /v1/projects/{ref}/database/query
sql = "select tablename, policyname, roles, cmd, left(qual, 120) as qual, left(with_check, 120) as with_check from pg_policies where schemaname = 'public' order by tablename, policyname;"

import urllib.request, ssl
ctx = ssl.create_default_context()
url = 'https://api.supabase.com/v1/projects/boihlgodmclljtckhmgz/database/query'
payload = json.dumps({'query': sql}).encode()

req = urllib.request.Request(url, data=payload, headers={
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
})
try:
    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        data = json.loads(resp.read().decode())
        print("=== RLS POLICIES ===")
        print(f"{'Table':30s} {'Policy':55s} {'Roles':20s} {'Cmd':10s} {'Qual (first 120)':120s}")
        print("-" * 235)
        for p in data:
            qual = (p.get('qual') or '')[:120]
            print(f"{p['tablename']:30s} {p['policyname']:55s} {str(p.get('roles','')):20s} {p['cmd']:10s} {qual}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"Error {e.code}: {body[:500]}")
    # Try alternative: use the SQL API via the database
    print("\nTrying alternative approach...")
    
    # Try direct REST API call with service key
    with open('/tmp/supa_service_key.txt') as f2:
        sk = f2.read().strip()
    
    # Use the pg_dump format - query the REST endpoint
    url2 = f'https://boihlgodmclljtckhmgz.supabase.co/rest/v1/rpc/'
    # Create a temp function to query
    print("Cannot query pg_catalog via REST API directly")
    sys.exit(1)