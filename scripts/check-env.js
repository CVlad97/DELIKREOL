#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Vérifie que toutes les variables d'environnement nécessaires sont définies
 * À exécuter avant le build de production
 */

const chalk = require('chalk');

const REQUIRED_ENV_VARS = [
  {
    name: 'VITE_SUPABASE_URL',
    description: 'URL du projet Supabase',
    example: 'https://your-project.supabase.co',
    validation: (val) => val.startsWith('https://') && val.includes('.supabase.co')
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    description: 'Clé anonyme publique Supabase',
    example: 'SUPABASE_ANON_KEY_REPLACE_ME
    validation: (val) => val.startsWith('eyJ') && val.length > 100
  }
];

const OPTIONAL_ENV_VARS = [
  {
    name: 'VITE_STRIPE_PUBLIC_KEY',
    description: 'Clé publique Stripe (pour paiements)',
    example: 'pk_...'
  },
  {
    name: 'VITE_GOOGLE_MAPS_API_KEY',
    description: 'Clé API Google Maps (optionnel, pour géolocalisation avancée)',
    example: 'AIzaSy...'
  },
  {
    name: 'VITE_SENTRY_DSN',
    description: 'Sentry DSN (pour monitoring erreurs)',
    example: 'https://...@sentry.io/...'
  }
];

function checkEnvVar(envVar) {
  const value = process.env[envVar.name];
  
  if (!value) {
    return {
      status: 'missing',
      message: `❌ ${chalk.red(envVar.name)} manquante`
    };
  }

  if (envVar.validation && !envVar.validation(value)) {
    return {
      status: 'invalid',
      message: `⚠️  ${chalk.yellow(envVar.name)} invalide (format incorrect)`
    };
  }

  return {
    status: 'ok',
    message: `✅ ${chalk.green(envVar.name)} OK`
  };
}

function main() {
  console.log(chalk.bold.blue('\n🔍 Vérification des variables d\'environnement\n'));

  let hasErrors = false;
  let hasWarnings = false;

  // Vérifier les variables obligatoires
  console.log(chalk.bold('Variables obligatoires:'));
  for (const envVar of REQUIRED_ENV_VARS) {
    const result = checkEnvVar(envVar);
    console.log(result.message);
    
    if (result.status !== 'ok') {
      console.log(`  ${chalk.gray('Description:')} ${envVar.description}`);
      console.log(`  ${chalk.gray('Exemple:')} ${envVar.example}\n`);
      hasErrors = true;
    }
  }

  // Vérifier les variables optionnelles
  console.log(chalk.bold('\nVariables optionnelles:'));
  for (const envVar of OPTIONAL_ENV_VARS) {
    const result = checkEnvVar(envVar);
    
    if (result.status === 'ok') {
      console.log(result.message);
    } else {
      console.log(`ℹ️  ${chalk.gray(envVar.name)} non définie (optionnel)`);
      hasWarnings = true;
    }
  }

  // Résumé
  console.log('\n' + chalk.bold('─'.repeat(60)) + '\n');

  if (hasErrors) {
    console.log(chalk.red.bold('❌ ÉCHEC: Variables obligatoires manquantes\n'));
    console.log(chalk.yellow('Pour Cloudflare Pages:'));
    console.log('1. Allez dans Dashboard > Pages > delikreol > Settings > Environment Variables');
    console.log('2. Ajoutez les variables manquantes pour Production ET Preview\n');
    console.log(chalk.yellow('Pour développement local:'));
    console.log('1. Créez un fichier .env.local à la racine du projet');
    console.log('2. Copiez le contenu depuis .env.example');
    console.log('3. Remplissez les valeurs depuis https://supabase.com/dashboard/project/boihlgodmclljtckhmgz/settings/api\n');
    process.exit(1);
  }

  if (hasWarnings) {
    console.log(chalk.yellow.bold('⚠️  AVERTISSEMENT: Variables optionnelles manquantes'));
    console.log(chalk.gray('L\'application fonctionnera avec des fonctionnalités limitées.\n'));
  } else {
    console.log(chalk.green.bold('✅ SUCCÈS: Toutes les variables sont correctement définies\n'));
  }

  // Afficher les URLs de configuration
  console.log(chalk.blue('🔗 Liens utiles:'));
  console.log(`  Supabase Dashboard: ${chalk.underline('https://supabase.com/dashboard/project/boihlgodmclljtckhmgz')}`);
  console.log(`  Cloudflare Pages: ${chalk.underline('https://dash.cloudflare.com')}`);
  console.log(`  Production: ${chalk.underline('https://delikreol.pages.dev')}\n`);

  process.exit(hasWarnings ? 0 : 0);
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { checkEnvVar, REQUIRED_ENV_VARS, OPTIONAL_ENV_VARS };
