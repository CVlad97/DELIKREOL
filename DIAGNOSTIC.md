# 🔍 Guide de Diagnostic - Écran Blanc DELIKREOL

## ✅ Status Actuel

Le projet compile **sans erreur** :
- ✅ TypeScript : 0 erreurs
- ✅ Build Vite : Succès (590 KB bundle)
- ✅ Supabase configuré

## 🎯 Diagnostic du Problème d'Affichage

### Étape 1 : Vérifier les Variables d'Environnement

Dans Bolt, va dans **Environment / Variables d'environnement** et vérifie :

```
VITE_SUPABASE_URL=https://xmwzpoqzwwjuzoedcqep.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci... (présent)
```

✅ Ces variables sont déjà configurées dans `.env`

### Étape 2 : Vérifier les Logs Console

Dans Bolt Preview, ouvre la **Console JavaScript** (F12) et regarde s'il y a :

- ❌ Erreurs rouges (Cannot find module, ReferenceError, etc.)
- ⚠️ Warnings jaunes
- ℹ️ Messages de chargement

**Si tu vois une erreur** → Note le message exact, ça nous dira quoi corriger.

### Étape 3 : Test avec App Minimaliste

Pour tester si le problème vient du code ou de l'environnement :

1. **Renomme le fichier actuel :**
   ```bash
   mv src/App.tsx src/App.backup.tsx
   ```

2. **Active le fichier de test :**
   ```bash
   mv src/App.test.tsx src/App.tsx
   ```

3. **Relance le preview** dans Bolt

**Résultat attendu :**
- ✅ Si tu vois "TEST DELIKREOL – Le preview fonctionne" → L'environnement est OK, le problème vient du code métier
- ❌ Si tu ne vois rien → Le problème est au niveau Vite/Environnement

### Étape 4 : Problèmes Connus et Solutions

#### 🔴 Problème : Écran blanc + Aucune erreur console

**Cause probable :** Context Provider qui plante silencieusement

**Solution :** Vérifie dans la console s'il y a des warnings React sur les hooks ou contexts

#### 🔴 Problème : "Cannot read property of undefined"

**Cause probable :** Un composant essaie d'accéder à des données non chargées

**Solution :** Vérifie les states de loading dans AuthContext et autres contextes

#### 🔴 Problème : "Module not found"

**Cause probable :** Import qui ne se résout pas

**Solution :** Vérifie les chemins d'imports dans App.tsx

## 🛠️ Actions de Correction Possibles

### Si le test App.test.tsx fonctionne :

1. **Teste les contextes un par un :**
   - Commence par retirer ErrorBoundary
   - Puis retire les providers un par un pour isoler le problème

2. **Vérifie AuthContext :**
   - C'est le plus susceptible de causer un problème au démarrage
   - Vérifie que `useAuth()` gère bien l'état `loading`

### Si le test App.test.tsx ne fonctionne pas :

1. **Vérifie le fichier index.html :**
   - Assure-toi que `<div id="root"></div>` existe

2. **Vérifie main.tsx :**
   - Les imports CSS doivent être valides
   - Le DOM mounting doit être correct

## 📝 Informations à Fournir

Si le problème persiste, fournis-moi :

1. **Message d'erreur exact** (de la console browser)
2. **Résultat du test** App.test.tsx (visible ou non ?)
3. **Logs Vite** (dans le terminal Bolt)

## 🔄 Restaurer l'App Originale

Si tu veux revenir à l'app normale après le test :

```bash
mv src/App.tsx src/App.test.tsx
mv src/App.backup.tsx src/App.tsx
```

---

**Note :** Le code compile parfaitement, donc le problème est à 99% lié à l'exécution runtime, pas à la syntaxe.
