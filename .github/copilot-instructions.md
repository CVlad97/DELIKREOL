# DELIKREOL - AI Coding Agent Instructions

## 🎯 Project Overview

DELIKREOL is an **intelligent logistics marketplace** for Martinique connecting restaurants, local producers, relay hosts, drivers, and customers through a multi-role platform with embedded AI agents. Not just a delivery app—it's an orchestration system with route optimization, partner scoring, and operations intelligence.

**Key Value Props:**
- **Multi-actor ecosystem**: customers, vendors (restaurants/producers), relay hosts, drivers, admins
- **AI-powered operations**: Route optimizer (auto-assign deliveries), Partner scorer (evaluate vendors), Operations Copilot (admin assistant)
- **Shared relay infrastructure**: Reduces logistics costs for small vendors
- **Real-time tracking**: GPS tracking with Leaflet/OpenStreetMap

## 🏗️ Architecture Essentials

### Core Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + RLS, Auth, Edge Functions, Realtime)
- **Mapping**: React Leaflet + OpenStreetMap
- **Payments**: Stripe Connect (via Edge Functions)
- **Build**: Vite with code splitting (react, supabase, leaflet vendors)

### Role-Based Architecture
Five distinct user types with isolated UI apps:
- **`customer`** → [CustomerApp](src/pages/CustomerApp.tsx) - Browse, order, track
- **`vendor`** → [VendorApp](src/pages/VendorApp.tsx) - Manage catalog, view orders
- **`relay_host`** → [RelayHostApp](src/pages/RelayHostApp.tsx) - Manage pickup points
- **`driver`** → [DriverApp](src/pages/DriverApp.tsx) - Accept deliveries, navigate
- **`admin`** → [AdminApp](src/pages/AdminApp.tsx) → [AdminHub](src/pages/AdminHub.tsx) - Platform operations

**Entry Pattern**: [App.tsx](src/App.tsx) → RoleSelector → Role-specific App component wrapped in MainShell

### Context System (Essential for State)
Use these React Contexts as foundation for all authenticated features:
- **[AuthContext](src/contexts/AuthContext.tsx)** - User session, profile, sign in/up/out
- **[CartContext](src/contexts/CartContext.tsx)** - Customer shopping cart
- **[ToastContext](src/contexts/ToastContext.tsx)** - Notifications (useToast hook)
- **[ThemeContext](src/contexts/ThemeContext.tsx)** - UI theming
- **[DraftRequestContext](src/contexts/DraftRequestContext.tsx)** - Client request drafting

**Pattern**: All provide Providers in App.tsx, use hooks in components. Always check context provides the data before querying DB.

### Data Layer Conventions

#### Supabase Integration [src/lib/supabase.ts](src/lib/supabase.ts)
```typescript
// Environment vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (checked in isSupabaseConfigured)
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', user!.id);  // Always filter by auth.uid() for RLS security
```

**RLS Security Rule**: Always include `.eq('user_id', user.id)` or role-based filters. Supabase blocks multi-tenant data leaks at database layer via Row Level Security policies.

#### Types [src/types/index.ts](src/types/index.ts)
Central enum definitions:
- `UserType` = 'customer' | 'vendor' | 'driver' | 'relay_host' | 'admin'
- `OrderStatus` = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in_delivery' | 'delivered' | 'cancelled'
- `DeliveryType` = 'home_delivery' | 'pickup' | 'relay_point'
- `VehicleType` = 'bike' | 'scooter' | 'car'
- `StorageType` = 'cold' | 'hot' | 'dry' | 'frozen'

Always import these from types/ instead of hardcoding strings.

## 🤖 Three AI Agents (Critical for Admin Features)

All defined in [src/agents/](src/agents/):

### 1. Operations Copilot [adminCopilot.ts](src/agents/adminCopilot.ts)
Real-time metrics aggregation + conversational AI for admins.

**Key Functions**:
- `aggregateDailyMetrics()` - Collects orders, drivers, relay capacity, revenue for today
- `generateCopilotSummary()` - Uses OpenAI to create alerts (saturated relays >80%, low drivers <3) and suggestions
- `askCopilot(question)` - Chat interface with context-aware responses

**Integrates into**: [AdminHub.tsx](src/pages/AdminHub.tsx) - Accessed via lateral panel

### 2. Route Optimizer [routeOptimizer.ts](src/agents/routeOptimizer.ts)
Auto-assigns deliveries to drivers using scoring algorithm.

**Algorithm**:
```
score = (distanceScore × 0.6) + (loadScore × 0.4)
distanceScore = max(0, 100 - distance_km × 10)
loadScore = max(0, 100 - active_deliveries × 30)
```
**Key Functions**:
- `optimizeRoutes(timeWindowMinutes)` - Returns assignments, unassigned orders, summary
- `assignRouteToDriver(driverId, orderIds)` - Persists assignments to DB, updates order statuses to 'in_delivery'

**Constraints**: Max 3 active deliveries per driver, only confirmed/preparing/ready orders, drivers must be available with GPS coords.

### 3. Partner Scorer [partnerScoring.ts](src/agents/partnerScoring.ts)
Auto-evaluates vendor/driver onboarding applications.

Grades A/B/C based on document completeness and compliance. Reduces evaluation time 7 days → 48h.

## ⚙️ Developer Workflows

### Setup & Build
```bash
npm install                    # Install dependencies
npm run dev                    # Start Vite dev server (http://localhost:5173)
npm run build                  # Production build (→ dist/)
npm run typecheck              # TypeScript validation
npm run lint                   # ESLint check (./eslint.config.js)
```

### Environment Setup
Create `.env.local` with:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxx...
```
Without these, app shows "Configuration requise" (lines 165-180 in App.tsx).

### Testing Strategy
- **No Jest/Vitest** - Project focuses on integration testing
- **Manual E2E**: Test role flows end-to-end (auth → role selection → app)
- **Type checking** first: `npm run typecheck` catches most bugs
- **Supabase RLS validation**: Test as different roles to verify policies block cross-role access

### Common Tasks

**Add new page**:
1. Create [src/pages/NewFeaturePage.tsx](src/pages/)
2. Import in [App.tsx](src/App.tsx) and wire route
3. Follow role-specific routing pattern (customer/pro/admin)

**Add form fields to onboarding**:
1. Extend types in [types/index.ts](src/types/index.ts)
2. Update [OnboardingForm.tsx](src/components/OnboardingForm.tsx) state + tabs
3. Add Supabase column migration if needed

**Implement new data query**:
1. Always wrap in `useEffect` + `try/catch`
2. Call `.eq('user_id', user.id)` for RLS
3. Show loading state + error toast via `useToast()`
4. Example: [OrderTracking.tsx](src/components/OrderTracking.tsx) pattern

## 🎨 UI/Component Patterns

### Styling
- **TailwindCSS utility-first** - No custom CSS files except [index.css](src/index.css) and [leaflet.css](src/leaflet.css)
- **Color scheme**: Orange/red gradients (from-orange-500 to-red-500), greens for positive actions
- **Icons**: Use Lucide React (`lucide-react` package) - e.g., `import { Home, LogOut } from 'lucide-react'`

### Modal Pattern
Use composition (state + conditional render):
```tsx
const [isOpen, setIsOpen] = useState(false);
return (
  <>
    <button onClick={() => setIsOpen(true)}>Open</button>
    {isOpen && <ModalComponent onClose={() => setIsOpen(false)} />}
  </>
);
```
See [AuthModal.tsx](src/components/AuthModal.tsx), [RoleInfoModal.tsx](src/components/RoleInfoModal.tsx)

### Error Handling
```tsx
import { useToast } from '../contexts/ToastContext';
const { showError, showSuccess } = useToast();

try {
  // action
  showSuccess('Success message');
} catch (err) {
  showError('Error: ' + err.message);
}
```

## 🔐 Security Essentials

### RLS (Row Level Security) - DB Layer
Supabase enforces policies automatically. Every query gets filtered by `auth.uid()`:
```sql
-- Example policy
CREATE POLICY "Customers see own orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());
```

**Golden Rule**: Always include `.eq('user_id', auth.uid())` in SELECT queries—it's filtered by RLS anyway, but makes intent clear.

### Role Verification
- **Client-side**: Check `profile?.user_type` for UX
- **Server-side**: RLS policies enforce—never trust client

### Payment Security
Stripe operations only via Supabase Edge Functions (not client-side). No sensitive keys in frontend.

## 📁 Key Directories

| Path | Purpose |
|------|---------|
| [src/pages/](src/pages/) | Full-page components for each role + main app entry |
| [src/components/](src/components/) | Reusable UI (modals, forms, cards) |
| [src/contexts/](src/contexts/) | React Context providers (auth, cart, toast) |
| [src/agents/](src/agents/) | AI agent implementations (route, partner, copilot) |
| [src/lib/](src/lib/) | Supabase client + utilities |
| [src/types/](src/types/) | Shared TypeScript enums & interfaces |
| [src/data/](src/data/) | Mock data for development |
| [src/config/](src/config/) | Integration configs (Stripe, API keys) |
| [src/utils/](src/utils/) | Utility functions |
| [docs/](docs/) | Architecture guides (agents.md, admin-operations.md) |
| [supabase/](supabase/) | Migrations + Edge Functions |

## 🚀 AI-Specific Guidance

### When Adding Features
1. **Check existing context** - Does AuthContext, CartContext already provide this? Avoid duplicate queries.
2. **Follow role isolation** - Features for vendors go in VendorApp/VendorPage, not CustomerApp.
3. **Reuse modal patterns** - [AuthModal](src/components/AuthModal.tsx), [RoleInfoModal](src/components/RoleInfoModal.tsx) templates
4. **Document complex logic** - Agent algorithms (route optimizer, partner scorer) have detailed comments

### Red Flags to Avoid
- ❌ Hardcoding role checks without types (`if (user.type === 'vendor')` → use `UserType` enum)
- ❌ Query without RLS filter (`.select('*')` without `.eq()`)
- ❌ Separate component trees for roles (use single App with conditional rendering)
- ❌ State in component (use Context for shared state)

### Common Reference Files
- Architecture: [docs/agents.md](docs/agents.md), [docs/admin-operations.md](docs/admin-operations.md)
- Security: [SECURITY_NOTES.md](SECURITY_NOTES.md), [SECURITY_FINAL_STATUS.md](SECURITY_FINAL_STATUS.md)
- Implementation status: [LEGAL_AND_ONBOARDING_READY.md](LEGAL_AND_ONBOARDING_READY.md)
