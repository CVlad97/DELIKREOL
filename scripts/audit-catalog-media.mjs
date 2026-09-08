#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parse } from '@babel/parser';

const root = process.cwd();
const catalogPath = join(root, 'src/data/mockCatalog.ts');
const galleriesPath = join(root, 'src/data/driveReimportAssets.ts');
const outputPath = resolve(root, process.argv[2] || 'reports/catalog-media-audit.json');
const distIndex = process.argv.indexOf('--dist');
const distDir = distIndex >= 0 && process.argv[distIndex + 1]
  ? resolve(root, process.argv[distIndex + 1])
  : null;

function parseTs(path) {
  return parse(readFileSync(path, 'utf8'), {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
}

function propName(property) {
  if (property.key?.type === 'Identifier') return property.key.name;
  if (property.key?.type === 'StringLiteral') return property.key.value;
  return null;
}

function stringValue(node) {
  if (!node) return null;
  if (node.type === 'StringLiteral') return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((part) => part.value.cooked || '').join('');
  }
  return null;
}

function productImage(node) {
  if (!node) return { kind: 'missing', path: null };
  if (node.type === 'Identifier' && node.name === 'photoAConfirmer') {
    return { kind: 'fallback', path: 'vendors/_fallback/photo-a-confirmer.svg' };
  }
  if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'vendorImage') {
    return { kind: 'asset', path: stringValue(node.arguments[0]) };
  }
  return { kind: 'unknown', path: null };
}

function findMockProducts(ast) {
  for (const statement of ast.program.body) {
    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (declaration?.type !== 'VariableDeclaration') continue;
    for (const item of declaration.declarations) {
      if (item.id.type !== 'Identifier' || item.id.name !== 'mockProducts') continue;
      let init = item.init;
      if (init?.type === 'TSAsExpression' || init?.type === 'TSSatisfiesExpression') init = init.expression;
      if (init?.type === 'ArrayExpression') return init.elements.filter(Boolean);
    }
  }
  throw new Error('mockProducts array not found');
}

function readProduct(node) {
  if (node.type !== 'ObjectExpression') return null;
  const values = new Map();
  for (const property of node.properties) {
    if (property.type !== 'ObjectProperty') continue;
    values.set(propName(property), property.value);
  }
  const image = productImage(values.get('image'));
  const ingredients = stringValue(values.get('ingredients'));
  const allergens = stringValue(values.get('allergens'));
  const description = stringValue(values.get('description'));
  const publicPath = image.path ? join(root, 'public', image.path) : null;
  const distPath = image.path && distDir ? join(distDir, image.path) : null;
  return {
    id: stringValue(values.get('id')),
    name: stringValue(values.get('name')),
    vendor: stringValue(values.get('vendor')),
    image,
    photoQuality: stringValue(values.get('photoQuality')),
    descQuality: stringValue(values.get('descQuality')),
    descriptionPresent: Boolean(description?.trim()),
    ingredientsToConfirm: /(?:à|a)\s+confirmer|à\s+valider/i.test(ingredients || ''),
    allergensToConfirm: /(?:à|a)\s+confirmer|à\s+valider/i.test(allergens || ''),
    sourceAssetExists: publicPath ? existsSync(publicPath) : false,
    distAssetExists: distPath ? existsSync(distPath) : null,
  };
}

const products = findMockProducts(parseTs(catalogPath)).map(readProduct).filter(Boolean);
const gallerySource = readFileSync(galleriesPath, 'utf8');
const galleryPaths = [...gallerySource.matchAll(/assetFromPublic\(['"]([^'"]+)['"]\)/g)].map((match) => match[1]);
const galleryAssets = [...new Set(galleryPaths)].map((path) => ({
  path,
  sourceAssetExists: existsSync(join(root, 'public', path)),
  distAssetExists: distDir ? existsSync(join(distDir, path)) : null,
}));

const byVendor = {};
for (const product of products) {
  const vendor = product.vendor || 'INCONNU';
  byVendor[vendor] ||= { products: 0, fallbackPhotos: 0, missingAssets: 0, photoToValidate: 0, descToValidate: 0, ingredientsToConfirm: 0, allergensToConfirm: 0 };
  const row = byVendor[vendor];
  row.products += 1;
  if (product.image.kind === 'fallback') row.fallbackPhotos += 1;
  if (product.image.kind === 'asset' && !product.sourceAssetExists) row.missingAssets += 1;
  if (!product.photoQuality || product.photoQuality !== 'validée') row.photoToValidate += 1;
  if (!product.descQuality || product.descQuality !== 'validée') row.descToValidate += 1;
  if (product.ingredientsToConfirm) row.ingredientsToConfirm += 1;
  if (product.allergensToConfirm) row.allergensToConfirm += 1;
}

const report = {
  generatedAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || null,
  summary: {
    products: products.length,
    fallbackPhotos: products.filter((p) => p.image.kind === 'fallback').length,
    missingProductAssets: products.filter((p) => p.image.kind === 'asset' && !p.sourceAssetExists).length,
    missingGalleryAssets: galleryAssets.filter((asset) => !asset.sourceAssetExists).length,
    missingDistProductAssets: distDir ? products.filter((p) => p.image.kind === 'asset' && !p.distAssetExists).length : null,
    missingDistGalleryAssets: distDir ? galleryAssets.filter((asset) => !asset.distAssetExists).length : null,
    photoQualityNotValidated: products.filter((p) => !p.photoQuality || p.photoQuality !== 'validée').length,
    descQualityNotValidated: products.filter((p) => !p.descQuality || p.descQuality !== 'validée').length,
    ingredientsToConfirm: products.filter((p) => p.ingredientsToConfirm).length,
    allergensToConfirm: products.filter((p) => p.allergensToConfirm).length,
  },
  byVendor,
  fallbackProducts: products.filter((p) => p.image.kind === 'fallback'),
  missingProductAssets: products.filter((p) => p.image.kind === 'asset' && !p.sourceAssetExists),
  missingGalleryAssets: galleryAssets.filter((asset) => !asset.sourceAssetExists),
  qualityReview: products.filter((p) => !p.photoQuality || p.photoQuality !== 'validée' || !p.descQuality || p.descQuality !== 'validée' || p.ingredientsToConfirm || p.allergensToConfirm),
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));
console.log(`Report written to ${outputPath}`);
