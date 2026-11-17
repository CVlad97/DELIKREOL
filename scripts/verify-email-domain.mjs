#!/usr/bin/env node
/**
 * DELIKREOL — contrôle de la capacité d'un domaine à envoyer ET recevoir.
 *
 * Écrit après avoir constaté, le 16/11/2026, que `delikreol.com` envoyait du
 * courrier (SPF + DKIM Hostinger Reach) mais ne pouvait rien recevoir : aucun
 * enregistrement MX. Toutes les adresses publiées sur le site rebondissaient.
 *
 * Usage :
 *   node scripts/verify-email-domain.mjs                 # delikreol.com
 *   node scripts/verify-email-domain.mjs ikabay.store
 *
 * Sortie 0 si le domaine peut recevoir ET envoyer, 1 sinon.
 */
import { resolveMx, resolveTxt } from 'node:dns/promises';

const domain = process.argv[2] || 'delikreol.com';

async function safe(fn, ...args) {
  try {
    return await fn(...args);
  } catch {
    return [];
  }
}

const mx = await safe(resolveMx, domain);
const txt = (await safe(resolveTxt, domain)).map((entry) => entry.join(''));
const dmarc = (await safe(resolveTxt, `_dmarc.${domain}`)).map((entry) => entry.join(''));
const spf = txt.find((entry) => entry.toLowerCase().startsWith('v=spf1')) || null;

console.log(`=== ${domain} ===`);
console.log(`MX      : ${mx.length ? mx.map((r) => `${r.priority} ${r.exchange}`).join(' | ') : '❌ AUCUN — le domaine ne peut rien recevoir'}`);
console.log(`SPF     : ${spf ?? '❌ absent'}`);
console.log(`DMARC   : ${dmarc[0] ?? '❌ absent'}`);

const canReceive = mx.length > 0;
const canSend = Boolean(spf) || (await safe(resolveTxt, `_dmarc.${domain}`)).length > 0;

if (!canReceive) {
  console.log('');
  console.log('Pour recevoir, ajouter chez le registrar (Hostinger → DNS) :');
  console.log('  MX  @  5    mx1.hostinger.com');
  console.log('  MX  @  10   mx2.hostinger.com');
  console.log('puis créer la boîte ou l’alias dans hPanel → Emails.');
}

console.log('');
console.log(`RECEVOIR : ${canReceive ? '✅' : '❌'}   ENVOYER : ${canSend ? '✅' : '⚠️'}`);
process.exit(canReceive && canSend ? 0 : 1);
