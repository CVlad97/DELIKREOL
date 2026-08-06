const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SK = fs.readFileSync('/tmp/supa_service_key.txt', 'utf-8').trim();
const supabase = createClient('https://boihlgodmclljtckhmgz.supabase.co', SK);

async function run() {
  // Read the migration that creates is_delikreol_admin()
  const sql = fs.readFileSync('/workspace/DELIKREOL/supabase/migrations/20260623000002_partner_access_pilot.sql', 'utf-8');
  
  // Extract just the function creation part
  const funcStart = sql.indexOf('CREATE OR REPLACE FUNCTION public.is_delikreol_admin');
  const funcEnd = sql.indexOf('$$;', funcStart) + 3;
  const funcSql = sql.substring(funcStart, funcEnd);
  
  console.log('Creating is_delikreol_admin()...');
  console.log('SQL length:', funcSql.length);
  
  // Execute via RPC (if exec_sql exists) or directly
  const { data, error } = await supabase.rpc('exec_sql', { query: funcSql });
  if (error) {
    console.log('RPC exec_sql failed:', error.message.slice(0, 100));
    // Try creating via raw REST insert
    console.log('Trying direct SQL execution...');
    const { data: d2, error: e2 } = await supabase
      .from('_exec_sql')
      .insert({ query: funcSql })
      .single();
    if (e2) console.log('Direct insert failed:', e2.message.slice(0, 150));
    else console.log('Function created via insert');
  } else {
    console.log('Function created via RPC:', data);
  }

  // Verify function exists
  const { data: verify, error: vErr } = await supabase.rpc('is_delikreol_admin');
  console.log('Verification call:', vErr ? vErr.message.slice(0, 100) : 'result=' + verify);
  
  // Also run the admin function hardening migration
  const hardeningSql = fs.readFileSync('/workspace/DELIKREOL/supabase/migrations/20260715000001_admin_function_hardening.sql', 'utf-8');
  console.log('\nRunning hardening migration...');
  const { data: d3, error: e3 } = await supabase.rpc('exec_sql', { query: hardeningSql });
  if (e3) console.log('Hardening error:', e3.message.slice(0, 150));
  else console.log('Hardening OK');
}
run().catch(console.error);