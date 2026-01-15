# 🚀 GitHub Codespaces - Quick Preview

## ⚡ Start Codespace (2 clicks)

### Option 1: From GitHub Website (Easiest)
1. Go to: https://github.com/CVlad97/DELIKREOL
2. Click **Code** → **Codespaces** → **Create codespace on main**
3. Wait ~2-3 minutes for environment setup
4. Done! VS Code opens in browser

### Option 2: From Local (VSCode)
1. Open this folder in VSCode
2. Command Palette (Ctrl+Shift+P): `Codespaces: Create Codespace`
3. Select "main" branch
4. Wait for creation

---

## 🎯 What Happens Automatically

```
1. Docker image spins up (Node 20 + TypeScript)
2. VS Code extensions install
3. npm install runs (via postCreateCommand)
4. npm run dev starts (via postStartCommand)
5. Port 5173 forwards automatically
6. Preview URL appears! ✅
```

---

## 📍 Access Your Preview

Once Codespace is ready:
- **Port Tab**: Click "5173" to see preview
- **Or Direct URL**: `https://[codespace-name]-5173.preview.app.github.dev`
- **Browser**: Automatically forwarded

---

## ✨ Pre-Configured

### Extensions Included
- ✅ ESLint
- ✅ Prettier (auto-format on save)
- ✅ Tailwind CSS
- ✅ React/TypeScript snippets

### Format & Lint Ready
- TypeScript strict mode enabled
- ESLint configured
- Prettier auto-format on save

---

## 🧪 Test All 5 Axes

Once preview is running:
1. **Badge HACCP** → Homepage, scroll "Pépites locales"
2. **CGU** → Footer "CGU" button
3. **Dashboard** → Login as vendor, navigate to dashboard
4. **TVA 8.5%** → Add item to cart, checkout
5. **Responsive** → F12 DevTools, test mobile

See: `MANUAL_TESTING_GUIDE.md` for detailed steps

---

## 🛠 Useful Commands in Codespace Terminal

```bash
# Type/run these directly in terminal:

npm run dev              # Start dev server (already running)
npm run typecheck       # Check TypeScript
npm run lint            # Run ESLint
npm run build           # Build for production
npm run preview         # Preview build output
```

---

## 💾 Your Work Persists

- Changes auto-save
- Codespace pauses when idle (keeps 30 days free)
- Reopen to continue

---

## 🎁 Features

| Feature | Status |
|---------|--------|
| **Full Dev Environment** | ✅ Ready |
| **Auto npm install** | ✅ Done |
| **Port forwarding** | ✅ Active |
| **VS Code Extensions** | ✅ Installed |
| **Auto Format** | ✅ Enabled |
| **DevTools Access** | ✅ Available |

---

## ⚡ Timeline

```
Click "Create Codespace"  → 2-3 min
Environment ready         → auto
npm install               → auto (1-2 min)
Dev server starts         → auto
Preview accessible        → ✅ READY
```

**Total: ~3-5 minutes to full preview!** 🚀

---

## 📚 Quick Links Inside Codespace

- `INDEX.md` - Navigation guide
- `QUICK_REFERENCE.md` - 5-minute overview
- `MANUAL_TESTING_GUIDE.md` - Full testing guide
- `.github/copilot-instructions.md` - Architecture

---

## 🆘 If Something Goes Wrong

```bash
# Terminal commands:

# Restart server
npm run dev

# Clear & reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npm run typecheck

# Full rebuild
npm run build
```

---

**Status:** ✅ Ready to Go  
**Time to Preview:** ~3-5 minutes  
**Cost:** Free (GitHub Codespaces included with repo)

---

**Next Action:** Click the **Code** button → **Codespaces** on GitHub! 🚀
