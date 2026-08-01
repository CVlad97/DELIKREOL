import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('admin payment reconciliation', () => {
  it('registers the admin page and route', () => {
    expect(read('src/pages/admin/AdminPaymentsReconciliation.tsx')).toContain('Rapprochement des paiements');
    expect(read('src/pages/admin/AdminLayout.tsx')).toContain('/admin/paiements');
    expect(read('src/router.tsx')).toContain('path="paiements"');
  });

  it('keeps payment review admin-only and audited', () => {
    const migration = read('supabase/migrations/20260731000002_admin_payment_reconciliation.sql');
    expect(migration).toContain('public.is_admin()');
    expect(migration).toContain('payment_audit_events');
    expect(migration).toContain('revoke all on function public.admin_review_payment');
    expect(migration).toContain('set search_path = public');
    expect(migration).not.toContain('to anon');
  });
});
