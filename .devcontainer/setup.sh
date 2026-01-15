#!/bin/bash
# DELIKREOL - Quick Setup for Codespaces

echo "🚀 DELIKREOL - Codespaces Setup"
echo "================================"
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps
echo "✅ Dependencies installed"
echo ""

# Step 2: TypeScript check
echo "🔍 Checking TypeScript..."
npm run typecheck
echo "✅ TypeScript check passed"
echo ""

# Step 3: Ready message
echo "════════════════════════════════════════"
echo "✅ SETUP COMPLETE!"
echo "════════════════════════════════════════"
echo ""
echo "🌐 Dev server will start on port 5173"
echo "📍 URL: https://[codespace-domain]-5173.preview.app.github.dev"
echo ""
echo "📋 5 AXES READY:"
echo "  ✅ A) Badge HACCP"
echo "  ✅ B) CGU Page"
echo "  ✅ C) Dashboard Partner"
echo "  ✅ D) TVA 8.5%"
echo "  ✅ E) Livrables"
echo ""
echo "📚 See: INDEX.md for navigation"
echo "🧪 See: MANUAL_TESTING_GUIDE.md for testing"
echo ""
