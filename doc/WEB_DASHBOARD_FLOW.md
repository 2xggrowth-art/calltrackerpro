# CALLpro Web Dashboard - Complete Flow Documentation
**Date:** 2026-02-20

---

## 1. Authentication Flow

```
User visits localhost:3000
        │
        ▼
   AuthContext checks
   isAuthenticated?
        │
   ┌────┴────┐
   No        Yes
   │          │
   ▼          ▼
Landing    DashboardRoutes
Page       (role-based redirect)
   │
   ▼
/login ──POST /api/auth/login──► Store token + user in localStorage
                                        │
                                        ▼
                                  Redirect by role:
                              ┌─────────┼──────────┐
                              ▼         ▼          ▼
                         super_admin  org_admin   agent/viewer
                              │      manager        │
                              ▼         │           ▼
                    /dashboard/admin    ▼      /dashboard
                      /overview    /dashboard/
                                  crm/tickets
```

**Key Files:**
- `src/contexts/AuthContext.jsx` - Auth state management
- `src/services/auth.js` - Login/logout API calls
- `src/services/api.js` - Axios instance with Bearer token interceptor
- `src/routes/AppRoutes.jsx` - Auth-based route switching
- `src/routes/DashboardRoutes.jsx` - Role-based route definitions

---

## 2. Page Structure

### Super Admin Flow (`/dashboard/admin/*`)

```
/dashboard/admin/overview ── Platform stats (orgs, users, calls, revenue)
        │
        ├── /admin/organizations ── CRUD organizations
        │         └── Create/Edit/Delete org modals
        │
        ├── /admin/users ── Manage all users across orgs
        │         └── Create/Edit/Delete user modals
        │
        ├── /admin/leads ── Leads management (mock data currently)
        │
        ├── /admin/analytics ── System-wide analytics
        │
        └── /admin/settings ── Platform settings
```

**Key Files:**
- `src/pages/Admin/Overview.jsx`
- `src/pages/Admin/Organizations.jsx`
- `src/pages/Admin/Users.jsx`
- `src/pages/Admin/Analytics.jsx`
- `src/pages/Admin/Settings.jsx`
- `src/pages/SuperAdmin/LeadsManagement.jsx`

### Organization User Flow (`/dashboard/*`)

```
/dashboard ── Welcome screen (stats cards, recent tickets, recent calls)
        │
        ├── CRM Section
        │    ├── /crm/tickets ── Ticket list (search, filter, pagination)
        │    │       ├── Click ticket → /crm/tickets/:id (detail view)
        │    │       └── "New Ticket" → /crm/tickets/new (create form)
        │    │
        │    ├── /crm/kanban ── Kanban board (PLACEHOLDER - Coming Soon)
        │    │
        │    ├── /crm/calls ── Call logs (filters, analytics panel, table)
        │    │       └── Click row → Call detail modal
        │    │
        │    └── /crm/analytics ── CRM analytics (PLACEHOLDER - Coming Soon)
        │
        ├── Administration (org_admin only)
        │    ├── /organization/users ── Manage org users
        │    └── /organization/settings ── Org settings
        │
        ├── /notifications ── Notification list (mock data)
        │
        └── /profile ── User profile
```

**Key Files:**
- `src/pages/Dashboard/Dashboard.jsx`
- `src/pages/Dashboard/Profile.jsx`
- `src/pages/Dashboard/Notifications.jsx`
- `src/pages/CRM/TicketList.jsx`
- `src/pages/CRM/TicketDetails.jsx`
- `src/pages/CRM/TicketCreate.jsx`
- `src/pages/CRM/TicketKanban.jsx`
- `src/pages/CRM/CallLogs.jsx`
- `src/pages/CRM/CRMAnalytics.jsx`
- `src/pages/Organization/OrganizationUsers.jsx`
- `src/pages/Organization/OrganizationSettings.jsx`

---

## 3. Component Hierarchy

```
App.js
 └── AuthProvider (context)
      └── Router
           └── AppRoutes
                └── DashboardRoutes
                     └── DashboardLayout
                          ├── Sidebar (left nav - always visible)
                          ├── Header (top bar)
                          │    ├── Search bar
                          │    ├── OrganizationSwitcher (super_admin)
                          │    ├── Notification dropdown (Menu)
                          │    └── Profile dropdown (Menu)
                          └── <Outlet /> ← page content renders here
```

**Key Layout Files:**
- `src/components/dashboard/DashboardLayout.jsx`
- `src/components/dashboard/Sidebar.jsx`
- `src/components/dashboard/Header.jsx`

**Shared Components:**
- `src/components/common/Button.jsx`
- `src/components/common/Input.jsx`
- `src/components/common/Card.jsx`
- `src/components/common/Modal.jsx`
- `src/components/common/LoadingSpinner.jsx`
- `src/components/common/ProtectedRoute.jsx`
- `src/components/common/OrganizationSwitcher.jsx`

---

## 4. Data Flow

```
React Component (pages/*.jsx)
    │
    ▼
Service layer (services/*.js)
    │  - ticketService.js     → /api/tickets/*
    │  - callLogsApi.js       → /api/call-logs/*
    │  - organizationService.js → /api/organizations/*
    │  - superAdminService.js → /api/super-admin/*
    │  - auth.js              → /api/auth/*
    │
    ▼
api.js (axios instance)
    │  - Base URL: https://calltrackerpro-backend.vercel.app
    │  - Interceptor: adds Authorization: Bearer <token>
    │  - On 401: clears auth, redirects to /login
    │
    ▼
Backend (Express.js on Vercel)
    │
    ▼
Supabase (PostgreSQL)
```

**Service Files:**
- `src/services/api.js` - Axios instance with interceptors
- `src/services/auth.js` - Login, logout, token management
- `src/services/ticketService.js` - Ticket CRUD + analytics
- `src/services/callLogsApi.js` - Call log CRUD + analytics
- `src/services/organizationService.js` - Org management
- `src/services/superAdminService.js` - Super admin operations
- `src/services/realTimeService.js` - SSE + WebSocket (not working)
- `src/services/demoService.js` - Demo/mock data for leads

---

## 5. Role-Based Access Control

```
Page/Feature          super_admin  org_admin  manager  agent  viewer
──────────────────────────────────────────────────────────────────────
Dashboard                 ✅          ✅        ✅      ✅      ✅
Tickets                   ✅          ✅        ✅      ✅      ✅ (read)
Kanban                    ✅          ✅        ✅      ✅      ❌
Call Logs                 ✅          ✅        ✅      ✅      ✅
CRM Analytics             ✅          ✅        ✅      ❌      ❌
Create Tickets            ✅          ✅        ✅      ✅      ❌
Delete Tickets            ✅          ✅        ✅      ❌      ❌
Admin Overview            ✅          ❌        ❌      ❌      ❌
Organizations             ✅          ❌        ❌      ❌      ❌
All Users                 ✅          ❌        ❌      ❌      ❌
Org Users                 ❌          ✅        ❌      ❌      ❌
Org Settings              ❌          ✅        ❌      ❌      ❌
Leads Management          ✅          ❌        ❌      ❌      ❌
System Analytics          ✅          ❌        ❌      ❌      ❌
Platform Settings         ✅          ✅        ❌      ❌      ❌
Export Data               ✅          ✅        ✅      ❌      ❌
View Analytics            ✅          ✅        ✅      ❌      ❌
```

**Permission Methods (AuthContext.jsx):**
- `isSuperAdmin()` → `role === 'super_admin'`
- `isOrgAdmin()` → `role === 'org_admin'`
- `canManageAllOrganizations()` → super_admin only
- `canManageOrganization()` → super_admin, org_admin
- `canManageTeam()` → super_admin, org_admin, manager
- `canViewAllTickets()` → super_admin, org_admin, manager
- `canCreateTickets()` → super_admin, org_admin, manager, agent
- `canEditTickets()` → super_admin, org_admin, manager, agent
- `canDeleteTickets()` → super_admin, org_admin, manager
- `canViewAnalytics()` → super_admin, org_admin, manager
- `canExportData()` → super_admin, org_admin, manager

---

## 6. Sidebar Navigation Structure

```
┌─────────────────────────┐
│  CallTracker Pro         │
│  [Role Label]            │
├─────────────────────────┤
│                          │
│  🏠 Dashboard            │  → /dashboard
│                          │
│  ── CRM ──               │
│  🎫 Tickets              │  → /dashboard/crm/tickets
│  📋 Kanban Board         │  → /dashboard/crm/kanban
│  📞 Call Logs            │  → /dashboard/crm/calls
│  📊 Analytics            │  → /dashboard/crm/analytics
│                          │
│  ── ADMINISTRATION ──    │  (super_admin + org_admin only)
│  🏢 Organizations        │  → /dashboard/admin/organizations
│  👥 Users                │  → /dashboard/admin/users
│  👤 Leads Management     │  → /dashboard/admin/leads
│  📈 System Analytics     │  → /dashboard/admin/analytics
│  ⚙️  Settings            │  → /dashboard/admin/settings
│                          │
│  🔔 Notifications        │  → /dashboard/notifications
│                          │
├─────────────────────────┤
│  👤 User Name            │
│  user@email.com          │
│  [Sign Out]              │
└─────────────────────────┘
```

---

## 7. Typical User Workflows

### Agent: Log a New Ticket (4 clicks)
```
1. Open app → /dashboard (see today's stats)
2. Click "New Ticket" button on dashboard
   OR click "Tickets" in sidebar → /crm/tickets
3. Click "New Ticket" → /crm/tickets/new
4. Fill form → Save
   → Redirected back to ticket list
```

### Manager: Review Team Performance (3 clicks)
```
1. Open app → /dashboard (see overview stats)
2. Click "Analytics" in sidebar → /crm/analytics
3. View charts, filter by date range/agent
```

### Org Admin: Add a New User (4 clicks)
```
1. Click "Users" in sidebar → /organization/users
2. Click "Add User" button
3. Fill modal form (name, email, role)
4. Click "Create" → User added to list
```

### Super Admin: Create Organization (4 clicks)
```
1. Click "Organizations" in sidebar → /admin/organizations
2. Click "Add Organization" button
3. Fill modal form (name, plan, details)
4. Click "Create" → Org added to list
```

### Any User: View Call History (2 clicks)
```
1. Click "Call Logs" in sidebar → /crm/calls
2. Click any row → Call detail modal opens
```

---

## 8. State Management

```
AuthContext (Global)
    ├── user (object: id, name, email, role, organizationId)
    ├── isAuthenticated (boolean)
    ├── isLoading (boolean)
    ├── error (string | null)
    ├── login(credentials) → async
    ├── logout() → async
    ├── clearError()
    └── Permission methods (isSuperAdmin, canViewAllTickets, etc.)

Page-Level State (useState/useEffect in each page)
    ├── Data arrays (tickets, calls, users, orgs)
    ├── Loading states
    ├── Error states
    ├── Filter/search state
    ├── Pagination state
    └── Modal open/close state

localStorage
    ├── authToken (JWT string)
    ├── user (JSON stringified user object)
    └── currentOrganization (JSON for org switcher)
```

---

## 9. API Endpoints Used by Web Dashboard

### Working Endpoints (backend responds)
| Method | Endpoint | Used By |
|---|---|---|
| POST | `/api/auth/login` | LoginPage |
| POST | `/api/auth/register` | (not exposed in web UI) |
| GET | `/api/tickets` | TicketList, Dashboard |
| POST | `/api/tickets` | TicketCreate |
| PUT | `/api/tickets/:id` | TicketDetails |
| GET | `/api/tickets/stats` | Dashboard |
| GET | `/api/call-logs` | CallLogs |
| GET | `/api/call-logs/analytics/stats` | CallLogs |
| GET | `/api/super-admin/organizations` | Organizations |
| POST | `/api/super-admin/organizations` | Organizations |
| DELETE | `/api/super-admin/organizations/:id` | Organizations |
| GET | `/api/super-admin/users` | Users |
| POST | `/api/super-admin/users` | Users |
| DELETE | `/api/super-admin/users/:id` | Users |
| GET | `/api/super-admin/stats` | Overview |

### Broken Endpoints (404 - not implemented)
| Method | Endpoint | Used By |
|---|---|---|
| GET | `/api/auth/me` | AuthContext refresh |
| POST | `/api/auth/refresh` | Token refresh |
| DELETE | `/api/tickets/:id` | TicketList |
| GET | `/api/tickets/:id/notes` | TicketDetails |
| POST | `/api/tickets/:id/notes` | TicketDetails |
| GET | `/api/tickets/:id/history` | TicketDetails |
| POST | `/api/tickets/bulk-update` | TicketList |
| GET | `/api/tickets/export` | TicketList |
| PUT | `/api/tickets/:id/assign` | TicketDetails |
| PUT | `/api/tickets/:id/escalate` | TicketDetails |
| GET | `/api/tickets/analytics/*` | CRMAnalytics |
| PUT | `/api/super-admin/organizations/:id` | Organizations |
| PUT | `/api/super-admin/users/:id` | Users |

---

*Generated by CALLpro Flow Analysis - February 2026*
