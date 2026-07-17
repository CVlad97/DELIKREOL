#!/usr/bin/env python3
"""Audit real RLS policies and indexes from Supabase"""
import subprocess, json, os, sys

with open('/tmp/supa_service_key.txt') as f:
    sk = f.read().strip()

import urllib.request, ssl
ctx = ssl.create_default_context()
h = {
    'apikey': sk,
    'Authorization': 'Bearer ' + sk,
    'Accept': 'application/json',
    'Accept-Profile': 'public'
}

def sql(query):
    """Execute SQL via REST API (using a workaround)"""
    # Use the /rest/v1/rpc/ endpoint with a custom SQL function
    # Since we can't run arbitrary SQL, query information_schema via REST
    import urllib.parse
    url = 'https://boihlgodmclljtckhmgz.supabase.co/rest/v1/' + urllib.parse.quote(query)
    req = urllib.request.Request(url, headers=h)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            return resp.read().decode()
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return json.loads(body)
        except:
            return body

# Get RLS policies by querying pg_policies via Supabase's pg_dump API
# Alternative: use /rest/v1/pg_catalog.pg_policies
print("=== REAL RLS POLICIES ===")
# Try direct table query via REST with schema prefix
url = 'https://boihlgodmclljtckhmgz.supabase.co/rest/v1/?select=tablename,policyname,roles,cmd&from=pg_policies&schemaname=eq.public'
req = urllib.request.Request(url, headers=h)
try:
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        data = json.loads(resp.read().decode())
        for p in data:
            print(f"  {p['tablename']:35s} {p['policyname']:50s} {str(p['roles']):20s} {p['cmd']}")
except Exception as e:
    print(f"Error: {e}")
    # Fallback: try querying information_schema directly  
    print("Trying alternative approach...")

# Get all indexes
print("\n=== REAL INDEXES ===")
url2 = 'https://boihlgodmclljtckhmgz.supabase.co/rest/v1/?select=tablename,indexname,indexdef&from=pg_indexes&schemaname=eq.public'
req2 = urllib.request.Request(url2, headers=h)
try:
    with urllib.request.urlopen(req2, context=ctx, timeout=15) as resp2:
        data2 = json.loads(resp2.read().decode())
        for idx in data2:
            print(f"  {idx['tablename']:30s} {idx['indexname']:50s}")
except Exception as e:
    print(f"Error: {e}")