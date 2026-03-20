# DELIKREOL - replit.md

## Overview

DELIKREOL is a Martinique-focused e-commerce and logistics platform connecting local food vendors, relay points, delivery drivers, and customers. It operates as a multi-role marketplace with a concierge-style ordering flow, partner onboarding, and AI-assisted operations.

**Core purpose:** Enable locals in Martinique to order créole food and local products from nearby vendors, with delivery to home or relay pickup points. Partners (vendors, drivers, relay hosts) have dedicated dashboards. Admins manage the full operation.

**Five user roles:**
- Customer (`/`) — browse catalog, submit requests
- Vendor (`/vendor`) — manage products and orders
- Driver (`/driver`) — delivery assignments and navigation
- Relay Host (`/relay_host`) — manage package deposits/pickups
- Admin (`/admin`) — full operational oversight

The app is in MVP/production-readiness phase targeting real deployment at `delikreol.com`.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend

- **Framework:** React 18 with TypeScript, bundled by Vite (using `@vitejs/plugin-react-swc` for fast builds)
- **Routing:** React Router DOM v7, using a custom role-based routing pattern inside `src/App.tsx` (not file-based routing). Routes are lazy-loaded with `React.lazy()` + `Suspense` to reduce initial bundle size.
- **Styling:** Tailwind CSS v3 with a custom design system (CSS variables for colors, shadows, and radii defined in `src/index.css`). Custom fonts: Inter (body) + Playfair Display (headings).
- **UI Components:** Shadcn/ui component library (`components.json` configured), using the "new-york" style. Icon library: Lucide React.
- **State Management:** React Context API for auth (`AuthContext`), cart (`CartContext`), theme (`ThemeContext`), and toast notifications (`ToastContext`). No external state library (Redux, Zustand) is used.
- **Maps:** Leaflet + React Leaflet for interactive delivery zone maps and relay point visualization.
- **QR Code:** `html5-qrcode` (scanning) + `qrcode.react` (generation) for relay point package management.
- **Error Handling:** Global `ErrorBoundary` component wraps the app.

**Key source structure:**
```
src/
  App.tsx            — Root router, lazy-loads role-specific apps
  main.tsx           — Entry point, wraps with BlinkProvider + BlinkAuthProvider
  agents/            — AI agents (adminCopilot, routeOptimizer, partnerScoring)
  components/        — Shared UI components (Cart, AuthModal, AddressAutocomplete, etc.)
  contexts/          — React Contexts (Auth, Cart, Theme, Toast)
  pages/             — Role-specific page apps (CustomerApp, VendorApp, DriverApp, etc.)
  services/          — Business logic services (geocodingService, partnerOnboardingService, etc.)
  utils/             — Utilities (stripe, apiIntegrations)
  lib/               — Supabase client setup
  types/             — Shared TypeScript types
```

### Backend

- **Database + Auth + Storage:** Supabase (PostgreSQL). The database has ~29 tables with Row Level Security (RLS) enabled on all user-facing tables.
- **Schema approach:** Migrations in `supabase/migrations/` (SQL files). Key table groups:
  - Core: `profiles`, `vendors`, `products`, `orders`, `order_items`
  - Logistics: `drivers`, `deliveries`, `relay_points`, `relay_point_deposits`, `storage_capacities`, `delivery_zones`
  - Governance: `partner_applications`, `partner_documents`, `compliance_checks`, `responsibility_matrix`
  - Payments: `payout_calculations`, `compensation_rules`
  - Engagement: `loyalty_events`, `investment_projects`
- **Edge Functions:** Supabase Edge Functions (Deno) in `supabase/functions/` handle server-side logic: Stripe payment processing, WhatsApp webhook, OpenAI calls. Secrets (Stripe secret key, OpenAI key, WhatsApp token) are stored only in Supabase Edge Function secrets — never in the frontend.
- **RLS Optimization:** Policies use `(select auth.uid())` pattern (evaluated once per query, not per row) for performance.

### AI Agents

Three TypeScript agents in `src/agents/`:
1. **adminCopilot.ts** — Aggregates daily metrics from Supabase, calls OpenAI GPT-4 to generate operational summaries, alerts, and suggestions for admins.
2. **routeOptimizer.ts** — Uses Haversine distance formula to assign delivery orders to available drivers optimally.
3. **partnerScoring.ts** — Scores incoming partner applications by completeness and generates AI feedback (grade A/B/C) for admin review.

### Geocoding

`src/services/geocodingService.ts` contains a built-in geographic database of 33 Martinique communes with GPS coordinates. Provides address autocomplete, delivery zone validation (Martinique bounding box), and distance calculation (Haversine). Does not call an external geocoding API — fully offline/embedded.

### Build Configuration

- **Vite config:** Manual chunk splitting for better caching — `react-vendor`, `map-vendor`, `supabase`, `qr-vendor`. Source maps disabled in production. esbuild minification.
- **Bundle targets:** Initial bundle ~82 KB (gzipped ~20 KB) thanks to lazy loading; lazy chunks loaded on demand.
- **Deployment:** Frontend → Vercel (`vercel.json` configured with SPA fallback). Backend → Supabase (managed).

### Demo Mode

When Supabase is not configured, the app falls back to `localStorage`-based demo mode, allowing role simulation without a real backend. Demo profiles are stored in `delikreol_demo_profiles` localStorage key.

### Authentication

- Supabase Auth (email/password) is the primary auth method.
- Google OAuth SSO is planned/documented (`GOOGLE_SSO_SETUP.md`) but not yet fully integrated.
- Multi-role support: a `profiles` table stores `user_type` (customer, vendor, relay_host, driver, admin).
- The `AuthContext` wraps the app and exposes `signIn`, `signUp`, and current user/role state.

### Payments

- Stripe Connect for split payments: vendor receives ~80%, driver ~70% of delivery fee, relay host gets per-package fee, platform takes commission.
- Client-side uses `VITE_STRIPE_PUBLISHABLE_KEY`. Secret key lives only in Supabase Edge Function secrets.

---

## External Dependencies

| Service | Purpose | Config |
|---|---|---|
| **Supabase** | Database (PostgreSQL), Auth, Storage, Edge Functions | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| **Stripe** | Payments, Stripe Connect for partner payouts | `VITE_STRIPE_PUBLISHABLE_KEY` (frontend); `STRIPE_SECRET_KEY` (Edge Function secret) |
| **OpenAI** | GPT-4 for admin copilot summaries and partner scoring | API key stored in Supabase admin panel, not in `.env` |
| **WhatsApp Business API (Meta)** | Customer order notifications via WhatsApp | `WHATSAPP_VERIFY_TOKEN` (Edge Function secret) |
| **Leaflet / OpenStreetMap** | Interactive maps for delivery zones and relay points | No API key required |
| **Google Fonts** | Inter + Playfair Display typography | Loaded via `<link>` in `index.html` |
| **Blink.new** | Platform hosting/preview tooling | `VITE_BLINK_PROJECT_ID`, `VITE_BLINK_PUBLISHABLE_KEY` |
| **Vercel** | Frontend hosting and CDN | `vercel.json` configured |
| **Google OAuth** | SSO login (planned) | Google Cloud Console OAuth credentials + Supabase OAuth provider config |
| **Google Workspace** | Email at `@delikreol.com` | DNS MX/SPF/DKIM/DMARC records on domain |

### Environment Variables (`.env`)

```
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  (or pk_live_...)
WHATSAPP_VERIFY_TOKEN=...  (server-side only, for Edge Functions)
```

**Important:** Never put `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`, or `WHATSAPP_VERIFY_TOKEN` in the frontend `.env`. These belong exclusively in Supabase Edge Function secrets.

### CI/CD

- GitHub Actions pipeline (`.github/workflows/webpack.yml`) runs `npm ci`, `npm run typecheck`, `npm run build` on push.
- E2E tests written with Playwright (`tests/customer-journey.spec.ts`) — not yet fully implemented but scaffolded.