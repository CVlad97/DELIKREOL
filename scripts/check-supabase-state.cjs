const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SK = fs.readFileSync('/tmp/supa_service_key.txt', 'utf-8').trim();
const supabase = createClient('https://boihlgodmclljtckhmgz.supabase.co', SK);

async function run() {
  console.log('Testing is_delikreol_admin()...');
  const { data, error } = await supabase.rpc('is_delikreol_admin');
  console.log('admin function:', error ? error.message.slice(0,100) : 'result=' + data);
  
  console.log('Checking admin_users...');
  const { data: admins, error: adminsErr } = await supabase
    .from('admin_users')
    .select('user_id, email')
    .limit(1);
  if (adminsErr) console.log('admin_users error:', adminsErr.message.slice(0,100));
  else console.log('admin_users:', JSON.stringify(admins));
  
  console.log('Checking vendors (public, verified, active)...');
  const { data: vendors, error: vErr } = await supabase
    .from('vendors')
    .select('name, status, is_public, is_active')
    .eq('is_public', true)
    .eq('is_active', true)
    .eq('status', 'verified');
  if (vErr) console.log('vendors error:', vErr.message.slice(0,100));
  else console.log('Public vendors (' + vendors.length + '):', vendors.map(v => v.name).join(', '));
}
run().catch(console.error);