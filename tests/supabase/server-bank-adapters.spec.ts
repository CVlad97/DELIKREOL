import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('server banking adapters', () => {
  it('keeps Qonto and Revolut adapters admin-only and server-secret only', () => {
    const sources = [
      read('supabase/functions/qonto-finance/index.ts'),
      read('supabase/functions/qonto-sync/index.ts'),
      read('supabase/functions/revolut-business/index.ts'),
    ];

    for (const source of sources) {
      expect(source).toContain('Admin required');
      expect(source).toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(source).not.toContain("'Access-Control-Allow-Origin': '*'");
      expect(source).not.toContain('VITE_');
    }
  });

  it('does not document private banking keys as VITE variables', () => {
    const env = read('.env.example');
    expect(env).toContain('BACKEND ONLY');
    expect(env).not.toContain('VITE_QONTO_API');
    expect(env).not.toContain('VITE_REVOLUT_API');
    expect(env).not.toContain('VITE_OPENAI_API_KEY');
  });
});
