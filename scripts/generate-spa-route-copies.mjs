#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const indexPath = join(distDir, 'index.html');

const routes = [
  'catalogue',
  'traiteurs',
  'panier',
  'compte',
  'devis',
  'devenir-partenaire',
  'marches-publics',
  'comptabilite',
  'demo',
  'devenir-livreur',
  'devenir-point-relais',
  'points-relais',
  'aide',
  'livraison',
  'contact',
  'feedback',
  'connexion',
  'inscription-traiteur',
  'pro',
  'partenaires-plateforme',
  'terminal-partenaire',
  'statut-commande',
  'carte',
  'partenaire',
  'avis',
  'cgu',
  'cgv',
  'confidentialite',
  'mentions-legales',
  'cookies',
  'remboursement',
  'conditions-partenaires',
];

if (!existsSync(indexPath)) {
  throw new Error(`Missing build entrypoint: ${indexPath}`);
}

for (const route of routes) {
  const outputPath = join(distDir, route, 'index.html');
  mkdirSync(dirname(outputPath), { recursive: true });
  copyFileSync(indexPath, outputPath);
}

console.log(`Generated ${routes.length} static SPA route entr${routes.length === 1 ? 'y' : 'ies'}.`);
