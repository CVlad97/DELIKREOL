import { describe, expect, it } from 'vitest';
import { probeCanonical, probeOrigin, summarize } from '../../scripts/audit-origins.mjs';

const APP_HTML = '<!doctype html><title>Delikreol - Marketplace Logistique Martinique</title>';

function fakeFetch({ status = 200, body = '', contentType = 'text/html' } = {}) {
  return async () => new Response(body, { status, headers: { 'content-type': contentType } });
}

function explodingFetch(code = 'ENOTFOUND') {
  return async () => {
    const error = new Error('getaddrinfo ' + code);
    error.code = code;
    throw error;
  };
}

describe('origines concurrentes', () => {
  it('échoue si une origine non canonique sert l\'application', async () => {
    const row = await probeOrigin('https://delikreol.pages.dev', { fetchImpl: fakeFetch({ body: APP_HTML }) });
    expect(row.status).toBe('FAIL');
    expect(row.detail).toContain('copie publique concurrente');
  });

  it('passe si un domaine parké répond 200 sans le balisage de l\'application', async () => {
    const row = await probeOrigin('https://delikreol.netlify.app', {
      fetchImpl: fakeFetch({ body: '<html><title>Domain parked</title></html>' }),
    });
    expect(row.status).toBe('PASS');
  });

  it('passe sur un 404', async () => {
    const row = await probeOrigin('https://delikreol.pages.dev', { fetchImpl: fakeFetch({ status: 404, body: 'Not Found' }) });
    expect(row.status).toBe('PASS');
  });

  it('passe quand le domaine ne résout pas, sans prétendre l\'avoir vérifié', async () => {
    const row = await probeOrigin('https://delikreol.netlify.app', { fetchImpl: explodingFetch() });
    expect(row.status).toBe('PASS');
    expect(row.detail).toContain('ENOTFOUND');
  });
});

describe('release du domaine canonique', () => {
  it('passe quand release.json est un vrai JSON de release', async () => {
    const body = JSON.stringify({ release: 'delikreol-abc1234', commit: 'abc1234', published_at: '2026-11-14T00:00:00.000Z' });
    const row = await probeCanonical('https://delikreol.com', {
      fetchImpl: fakeFetch({ body, contentType: 'application/json; charset=utf-8' }),
    });
    expect(row.status).toBe('PASS');
    expect(row.detail).toContain('delikreol-abc1234');
  });

  it('échoue quand le repli SPA renvoie index.html à la place du JSON', async () => {
    const row = await probeCanonical('https://delikreol.com', { fetchImpl: fakeFetch({ body: APP_HTML }) });
    expect(row.status).toBe('FAIL');
    expect(row.detail).toContain('SPA fallback');
  });

  it('échoue quand le JSON existe mais ne porte pas de commit', async () => {
    const row = await probeCanonical('https://delikreol.com', {
      fetchImpl: fakeFetch({ body: '{"release":"x"}', contentType: 'application/json' }),
    });
    expect(row.status).toBe('FAIL');
  });

  it('échoue si le canonique est injoignable : deployé n\'est pas vérifié', async () => {
    const row = await probeCanonical('https://delikreol.com', { fetchImpl: explodingFetch('ECONNREFUSED') });
    expect(row.status).toBe('FAIL');
  });
});

describe('verdict global', () => {
  it('est FAIL dès qu\'une seule ligne échoue', () => {
    expect(summarize([{ status: 'PASS' }, { status: 'FAIL' }]).state).toBe('FAIL');
  });

  it('est PASS seulement si tout passe', () => {
    expect(summarize([{ status: 'PASS' }, { status: 'PASS' }]).state).toBe('PASS');
  });
});
