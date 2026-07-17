#!/usr/bin/env node
/**
 * Générateur de sitemap.xml pour DeliKreol.
 * Liste blanche des routes publiques indexables.
 * Les pages utilitaires (panier, connexion, feedback, compte, admin) sont exclues.
 */
const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://delikreol.com';
const TODAY = new Date().toISOString().split('T')[0];

const publicRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly', lastmod: TODAY },
  { path: '/catalogue', priority: '0.9', changefreq: 'daily', lastmod: TODAY },
  { path: '/traiteurs', priority: '0.8', changefreq: 'weekly', lastmod: TODAY },
  { path: '/devis', priority: '0.7', changefreq: 'weekly', lastmod: TODAY },
  { path: '/devenir-partenaire', priority: '0.6', changefreq: 'monthly', lastmod: TODAY },
  { path: '/devenir-livreur', priority: '0.6', changefreq: 'monthly', lastmod: TODAY },
  { path: '/points-relais', priority: '0.5', changefreq: 'monthly', lastmod: TODAY },
  { path: '/livraison', priority: '0.5', changefreq: 'monthly', lastmod: TODAY },
  { path: '/aide', priority: '0.4', changefreq: 'monthly', lastmod: TODAY },
  { path: '/contact', priority: '0.5', changefreq: 'monthly', lastmod: TODAY },
  { path: '/inscription-traiteur', priority: '0.6', changefreq: 'monthly', lastmod: TODAY },
  { path: '/cgu', priority: '0.3', changefreq: 'monthly', lastmod: TODAY },
  { path: '/cgv', priority: '0.3', changefreq: 'monthly', lastmod: TODAY },
  { path: '/confidentialite', priority: '0.3', changefreq: 'monthly', lastmod: TODAY },
  { path: '/mentions-legales', priority: '0.3', changefreq: 'monthly', lastmod: TODAY },
  { path: '/cookies', priority: '0.3', changefreq: 'monthly', lastmod: TODAY },
  { path: '/remboursement', priority: '0.3', changefreq: 'monthly', lastmod: TODAY },
  { path: '/conditions-partenaires', priority: '0.3', changefreq: 'monthly', lastmod: TODAY },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes.map(r => `  <url>
    <loc>${DOMAIN}${r.path}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml.trim() + '\n');
console.log(`Sitemap generated: ${outPath} (${publicRoutes.length} routes)`);
