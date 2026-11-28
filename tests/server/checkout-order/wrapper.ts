// Lance la vraie fonction checkout-order sur 127.0.0.1:8000 uniquement (aucune exposition publique).
const orig = Deno.serve;
// deno-lint-ignore no-explicit-any
(Deno as any).serve = (a: any, b?: any) =>
  typeof a === 'function' ? orig({ hostname: '127.0.0.1', port: 8000 }, a) : orig({ ...a, hostname: '127.0.0.1', port: 8000 }, b);
await import('../../../supabase/functions/checkout-order/index.ts');
