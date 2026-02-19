# CallTracker Pro - System Architecture Documentation

> **Generated:** February 19, 2026
> **Repository:** github.com/2xggrowth-art/calltrackerpro

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Backend (Node.js / Express)](#3-backend-nodejs--express)
4. [Android App (Java)](#4-android-app-java)
5. [Web Dashboard (React)](#5-web-dashboard-react)
6. [System Connections & Data Flow](#6-system-connections--data-flow)
7. [Authentication & Authorization Flow](#7-authentication--authorization-flow)
8. [Multi-Tenancy Model](#8-multi-tenancy-model)
9. [Real-Time Communication](#9-real-time-communication)
10. [Data Models & Relationships](#10-data-models--relationships)
11. [Deployment Architecture](#11-deployment-architecture)
12. [API Endpoint Reference](#12-api-endpoint-reference)
13. [Role-Based Access Control Matrix](#13-role-based-access-control-matrix)

---

## 1. Project Overview

**CallTracker Pro** is a multi-tenant SaaS platform for call tracking, CRM, and ticket management. It consists of three interconnected systems:

| Component | Technology | Location | Deployment |
|-----------|-----------|----------|------------|
| **Backend API** | Node.js, Express.js | `/backend` | Vercel (Serverless) |
| **Android App** | Java, Android SDK 34 | `/app` | Google Play / Direct APK |
| **Web Dashboard** | React 19, Tailwind CSS | `/webdashboard` | Netlify |

**Core Capabilities:**
- Automatic call tracking & logging from Android devices
- Auto-ticket creation from incoming/outgoing calls
- CRM pipeline with lead management (Kanban board)
- Role-based dashboards (Super Admin, Org Admin, Manager, Agent, Viewer)
- Multi-organization support with subscription tiers
- Real-time notifications via SSE and WebSocket
- SLA tracking with breach detection and escalation
- Analytics and performance metrics at individual/team/org levels

---

## 2. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                          │
│                                                                         │
│  ┌───────────────────┐              ┌───────────────────────────────┐   │
│  │   ANDROID APP     │              │       WEB DASHBOARD           │   │
│  │   (Java/Kotlin)   │              │       (React 19)              │   │
│  │                   │              │                               │   │
│  │  - Call Tracking  │              │  - Landing Page (Marketing)   │   │
│  │  - Auto Tickets   │              │  - Admin Dashboard            │   │
│  │  - Role Dashboards│              │  - CRM / Tickets / Kanban     │   │
│  │  - SSE/WebSocket  │              │  - Analytics / Reports        │   │
│  │  - Firebase       │              │  - Organization Management    │   │
│  └────────┬──────────┘              └──────────────┬────────────────┘   │
│           │ Retrofit + OkHttp                      │ Axios              │
│           │ Bearer Token                           │ Bearer Token       │
└───────────┼────────────────────────────────────────┼────────────────────┘
            │              HTTPS / WSS               │
            ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     BACKEND API (Express.js on Vercel)                   │
│                                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  Auth    │  │  Middleware   │  │  Routes    │  │  Services        │  │
│  │  (JWT)   │  │  - auth      │  │  - auth    │  │  - emailService  │  │
│  │          │  │  - multiTen  │  │  - tickets │  │  - SSE streams   │  │
│  │          │  │  - superAdm  │  │  - calls   │  │                  │  │
│  │          │  │  - roleChk   │  │  - orgs    │  │                  │  │
│  └──────────┘  └──────────────┘  │  - users   │  └──────────────────┘  │
│                                  │  - contacts│                         │
│                                  │  - teams   │                         │
│                                  │  - notifs  │                         │
│                                  │  - demo    │                         │
│                                  │  - admin   │                         │
│                                  └────────────┘                         │
└────────────┬──────────────────────────────────┬─────────────────────────┘
             │                                  │
             ▼                                  ▼
┌────────────────────────┐       ┌──────────────────────────┐
│   MongoDB (Primary)    │       │   Supabase PostgreSQL    │
│   - Mongoose ORM       │       │   - Row-Level Security   │
│   - Atlas (Production) │       │   - Service Role Key     │
│   - localhost (Dev)    │       │   - Supabase-specific    │
│                        │       │     routes & models      │
└────────────────────────┘       └──────────────────────────┘
```

---

## 3. Backend (Node.js / Express)

### 3.1 Directory Structure

```
backend/
├── api/
│   └── index.js              # Vercel serverless entry point
├── app.js                    # Express app setup & middleware
├── server.js                 # Local dev server (port 5000)
├── config/
│   ├── database.js           # MongoDB connection (Mongoose)
│   └── supabase.js           # Supabase client init
├── middleware/
│   ├── auth.js               # JWT verification + role/permission checks
│   ├── multiTenantAuth.js    # Organization/team context enforcement
│   └── superAdmin.js         # Super admin gate
├── models/
│   ├── User.js               # User schema (roles, teams, permissions)
│   ├── Organization.js       # Org schema (subscriptions, limits, settings)
│   ├── Ticket.js             # Ticket schema (SLA, status, assignment)
│   ├── CallLog.js            # Call log schema (duration, type, AI fields)
│   ├── Contact.js            # Contact/lead schema
│   ├── Team.js               # Team schema (members, targets)
│   ├── Invitation.js         # User invitations
│   ├── TicketHistory.js      # Ticket change audit trail
│   ├── TicketNote.js         # Ticket notes
│   ├── SupabaseUser.js       # Supabase-specific user model
│   └── SupabaseOrganization.js
├── routes/
│   ├── auth.js               # Register, login, logout
│   ├── tickets.js            # CRUD + assign + notes + SSE stream
│   ├── callLogs.js           # CRUD + analytics + SSE stream
│   ├── contacts.js           # CRUD contacts/leads
│   ├── organizations.js      # Organization management
│   ├── superAdmin.js         # Platform-wide admin operations
│   ├── notifications.js      # Notification endpoints
│   ├── invitations.js        # User invitation management
│   ├── demoRequests.js       # Demo scheduling
│   └── supabase*.js          # Supabase-specific route variants
├── services/
│   └── emailService.js       # Nodemailer (SendGrid prod, Ethereal dev)
├── migrations/
│   ├── 001_create_tables.sql # Supabase PostgreSQL schema
│   ├── 002_demo_requests.sql
│   └── 003_simplified_demo_requests.sql
└── vercel.json               # Vercel deployment config
```

### 3.2 Middleware Pipeline

```
Incoming Request
      │
      ▼
┌─────────────────┐
│  express.json()  │  Parse JSON body
└────────┬────────┘
         ▼
┌─────────────────┐
│  CORS Headers    │  Allow cross-origin (Android + Web)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Route Matching  │  /api/auth/*, /api/tickets/*, etc.
└────────┬────────┘
         ▼
┌─────────────────┐     ┌─────────────────────────────────┐
│  auth middleware  │────▶│ Verify JWT token                │
│  (per-route)     │     │ Attach user to req.user         │
└────────┬────────┘     │ Generate: req.user.id, .role,   │
         │              │   .organizationId                │
         ▼              └─────────────────────────────────┘
┌─────────────────┐
│ multiTenantAuth  │  Enforce org/team data scoping
└────────┬────────┘
         ▼
┌─────────────────┐
│ checkRole /      │  Validate role + permissions
│ checkPermission  │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Route Handler   │  Business logic + DB operations
└─────────────────┘
```

### 3.3 Dual Database Strategy

The backend supports **two databases simultaneously**:

| Feature | MongoDB (Primary) | Supabase PostgreSQL |
|---------|-------------------|---------------------|
| ORM | Mongoose | Supabase JS Client |
| Connection | `MONGODB_URI` env var | `SUPABASE_URL` + service role key |
| Models | `/models/*.js` | `/models/Supabase*.js` |
| Routes | `/routes/*.js` | `/routes/supabase*.js` |
| Security | Application-level | Row-Level Security (RLS) |
| Fallback | In-memory demo data | N/A |

**MongoDB** is the primary database with Mongoose schemas. **Supabase** provides a PostgreSQL alternative with RLS-enforced multi-tenancy. The backend falls back to in-memory demo data if MongoDB is unavailable.

---

## 4. Android App (Java)

### 4.1 Directory Structure

```
app/app/src/main/java/com/calltrackerpro/calltracker/
├── MainActivity.java               # API testing & call log sync
├── DashboardRouterActivity.java     # Role-based dashboard loader
├── ui/login/
│   ├── LoginActivity.java          # Email/password login
│   ├── LoginViewModel.java         # Login state management
│   └── LoginViewModelFactory.java
├── activities/
│   ├── UnifiedDashboardActivity.java  # Enhanced dashboard
│   ├── TicketDetailsActivity.java     # Ticket details view
│   └── TicketPopupActivity.java       # Auto-ticket popup overlay
├── fragments/
│   ├── AgentDashboardFragment.java      # Agent view
│   ├── ManagerDashboardFragment.java    # Manager view
│   ├── OrgAdminDashboardFragment.java   # Org admin view
│   ├── SuperAdminDashboardFragment.java # Super admin view
│   ├── ViewerDashboardFragment.java     # Read-only view
│   ├── CallLogsFragment.java            # Call history
│   ├── ContactsFragment.java            # Contacts
│   ├── TicketsFragment.java             # Tickets list
│   ├── EnhancedTicketsFragment.java     # Enhanced tickets
│   ├── UserManagementFragment.java      # User CRUD
│   ├── TeamManagementFragment.java      # Team CRUD
│   ├── OrganizationManagementFragment.java
│   ├── OrganizationAnalyticsFragment.java
│   ├── TeamAnalyticsFragment.java
│   ├── IndividualAnalyticsFragment.java
│   ├── SettingsFragment.java
│   └── MoreMenuFragment.java
├── adapters/              # RecyclerView adapters
├── models/                # Data classes (User, Ticket, CallLog, etc.)
├── services/
│   ├── ApiService.java              # Retrofit API interface
│   ├── EnhancedCallService.java     # Auto call log + ticket creation
│   ├── CallReceiverService.java     # Foreground call tracking
│   ├── SSEService.java              # Server-Sent Events client
│   ├── NotificationService.java     # Push notification handler
│   ├── RealTimeNotificationService.java
│   └── TicketService.java           # Ticket operations
├── receivers/
│   ├── CallReceiver.java            # BroadcastReceiver for phone states
│   ├── BootReceiver.java            # Re-enable tracking after reboot
│   └── TicketPopupReceiver.java     # Show ticket popup
└── utils/
    ├── RetrofitClient.java          # Retrofit + OkHttp config
    ├── TokenManager.java            # JWT + session storage
    ├── WebSocketManager.java        # WebSocket real-time client
    ├── PermissionManager.java       # Role-based permission engine
    ├── PreferenceManager.java       # SharedPreferences wrapper
    ├── NetworkHelper.java           # Connectivity checks
    ├── RealTimeUpdateManager.java   # SSE/WS coordination
    └── UIHelper.java                # UI utilities
```

### 4.2 App Startup & Navigation Flow

```
App Launch
    │
    ▼
LoginActivity
    │ Check TokenManager.isLoggedIn()
    │
    ├─ YES ──▶ DashboardRouterActivity
    │                │
    │                │ PermissionManager checks role
    │                │
    │                ├─ super_admin ──▶ OrgAdminDashboardFragment
    │                ├─ org_admin ────▶ OrgAdminDashboardFragment
    │                ├─ manager ──────▶ ManagerDashboardFragment
    │                ├─ agent ────────▶ AgentDashboardFragment
    │                └─ viewer ───────▶ ViewerDashboardFragment
    │
    └─ NO ───▶ Show Login Form
                   │
                   ▼
              POST /api/auth/login
                   │
                   ▼
              TokenManager.saveAuthData()
                   │
                   ▼
              DashboardRouterActivity
```

### 4.3 Call Tracking Mechanism

This is the **core differentiator** of the Android app - automatic call tracking:

```
Phone Call (Incoming/Outgoing)
         │
         ▼
┌────────────────────┐
│   CallReceiver     │  BroadcastReceiver for PHONE_STATE_CHANGED
│   (System Event)   │  Detects: RINGING → OFFHOOK → IDLE
└────────┬───────────┘
         │ Broadcasts to services
         ▼
┌────────────────────┐
│ CallReceiverService│  Foreground service (stays alive)
│ (State Tracking)   │  Tracks call state transitions
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ EnhancedCallService│  Smart call handler
│                    │
│ On Call Start:     │  GET /api/call-logs/history/{phone}
│   - Fetch history  │  Show caller info to agent
│                    │
│ On Call End:       │  POST /api/call-logs/with-ticket
│   - Log call       │  Auto-create ticket if configured
│   - Create ticket  │
│   - Show popup     │  Broadcast → TicketPopupActivity
└────────────────────┘
```

### 4.4 Key Permissions

| Permission | Purpose |
|-----------|---------|
| `READ_PHONE_STATE` | Detect incoming calls |
| `READ_CALL_LOG` / `WRITE_CALL_LOG` | Access call history |
| `PROCESS_OUTGOING_CALLS` | Monitor outgoing calls |
| `RECORD_AUDIO` | Call transcription (future) |
| `READ_CONTACTS` | Contact integration |
| `RECEIVE_BOOT_COMPLETED` | Re-enable tracking after reboot |
| `SYSTEM_ALERT_WINDOW` | Ticket popup overlay |
| `FOREGROUND_SERVICE` | Background call tracking |
| `INTERNET` / `ACCESS_NETWORK_STATE` | API communication |

---

## 5. Web Dashboard (React)

### 5.1 Directory Structure

```
webdashboard/src/
├── App.js                        # Root: AuthProvider + Router
├── routes/
│   ├── AppRoutes.jsx             # Top-level route switch
│   ├── DashboardRoutes.jsx       # Authenticated dashboard routes
│   └── LandingRoutes.jsx         # Public landing page routes
├── contexts/
│   └── AuthContext.jsx           # Global auth state (useReducer)
├── services/
│   ├── api.js                    # Axios instance + interceptors
│   ├── auth.js                   # Login, logout, token management
│   ├── ticketService.js          # Ticket CRUD operations
│   ├── callLogService.js         # Call log operations
│   ├── callLogsApi.js            # Alternative call logs API
│   ├── contactService.js         # Contact management
│   ├── organizationService.js    # Organization operations
│   ├── userService.js            # User management
│   ├── notificationService.js    # Notification SSE + HTTP
│   ├── realTimeService.js        # SSE + WebSocket manager
│   ├── demoService.js            # Demo request handling
│   ├── registrationService.js    # User registration
│   └── backendSetup.js           # Backend config checker
├── components/
│   ├── common/
│   │   ├── ProtectedRoute.jsx    # Route-level auth guard
│   │   ├── RoleGuard.jsx         # Component-level role check
│   │   ├── OrganizationSwitcher.jsx  # Multi-org switcher
│   │   ├── Button.jsx, Card.jsx, Input.jsx, Modal.jsx
│   │   └── LoadingSpinner.jsx
│   ├── dashboard/
│   │   ├── DashboardLayout.jsx   # Sidebar + Header wrapper
│   │   ├── Sidebar.jsx           # Role-aware navigation
│   │   └── Header.jsx            # Top bar with user menu
│   ├── landing/                  # Marketing site components
│   │   ├── Hero.jsx, Features.jsx, Pricing.jsx
│   │   ├── About.jsx, Contact.jsx, Footer.jsx
│   │   └── Header.jsx
│   ├── CallLogs/                 # Call log components
│   ├── tickets/                  # Ticket form components
│   ├── analytics/                # Analytics dashboard
│   ├── crm/                      # CRM pipeline (Kanban)
│   ├── leads/                    # Lead management
│   └── demo/                     # Demo scheduling
├── pages/
│   ├── Landing/LandingPage.jsx   # Public marketing page
│   ├── Admin/
│   │   ├── LoginPage.jsx         # Login form
│   │   ├── Overview.jsx          # Super admin overview
│   │   ├── Organizations.jsx     # Manage all orgs
│   │   ├── Users.jsx             # Manage all users
│   │   ├── Analytics.jsx         # Platform analytics
│   │   └── Settings.jsx          # System settings
│   ├── CRM/
│   │   ├── TicketList.jsx        # Ticket list with filters
│   │   ├── TicketCreate.jsx      # New ticket form
│   │   ├── TicketDetails.jsx     # Ticket detail view
│   │   ├── TicketKanban.jsx      # Drag-drop Kanban board
│   │   ├── CallLogs.jsx          # Call history page
│   │   └── CRMAnalytics.jsx      # CRM metrics
│   ├── Dashboard/
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── Profile.jsx           # User profile
│   │   └── Notifications.jsx     # Notification center
│   ├── Organization/
│   │   ├── OrganizationUsers.jsx     # Org user management
│   │   └── OrganizationSettings.jsx  # Org settings
│   └── SuperAdmin/
│       └── LeadsManagement.jsx   # Demo leads tracking
├── hooks/
│   └── useCallLogs.js            # Call logs data hook
└── utils/
    ├── roleBasedApi.js           # Role-aware API helpers
    └── corsTest.js               # CORS debugging utility
```

### 5.2 Route Map

```
/ ─────────────────────▶ LandingPage (unauthenticated)
/login ─────────────────▶ LoginPage
/unauthorized ──────────▶ Unauthorized message
/dashboard ─────────────▶ Dashboard (home)
/dashboard/profile ─────▶ Profile
/dashboard/notifications ▶ Notifications
/dashboard/crm/tickets ─▶ TicketList          [all roles]
/dashboard/crm/tickets/new ▶ TicketCreate     [agent+]
/dashboard/crm/tickets/:id ▶ TicketDetails    [agent+]
/dashboard/crm/kanban ──▶ TicketKanban        [agent+]
/dashboard/crm/calls ───▶ CallLogs            [all roles]
/dashboard/crm/analytics ▶ CRMAnalytics       [manager+]
/dashboard/admin/overview ▶ Overview           [super_admin]
/dashboard/admin/organizations ▶ Organizations [super_admin]
/dashboard/admin/users ──▶ Users              [super_admin]
/dashboard/admin/leads ──▶ LeadsManagement    [super_admin]
/dashboard/admin/analytics ▶ Analytics        [super_admin]
/dashboard/admin/settings ▶ Settings          [super_admin]
/dashboard/organization/users ▶ OrgUsers      [org_admin]
/dashboard/organization/settings ▶ OrgSettings [org_admin]
```

### 5.3 State Management

- **AuthContext** (React Context + useReducer) - Global auth state, role checking
- **localStorage** - Token persistence (`authToken`, `user`, `currentOrganization`)
- **Component state** (useState/useCallback) - Page-level filters, modals, pagination
- No Redux or external state management library

### 5.4 Styling

- **Tailwind CSS 3.4** with custom theme
- Color palette: Purple gradient primary (`#667eea` → `#764ba2`)
- **Framer Motion** for animations
- **Headless UI** for accessible dropdowns/modals
- **Recharts** for analytics charts
- **@dnd-kit** for Kanban drag-and-drop

---

## 6. System Connections & Data Flow

### 6.1 Connection Map

```
┌──────────────────────┐         ┌───────────────────────┐
│    ANDROID APP       │         │    WEB DASHBOARD      │
│                      │         │                       │
│  RetrofitClient      │         │  Axios Instance       │
│  Base URL:           │         │  Base URL:            │
│  calltrackerpro-     │         │  calltrackerpro-      │
│  backend.vercel.app  │         │  backend.vercel.app   │
│  /api/               │         │                       │
│                      │         │  Interceptors:        │
│  OkHttp Interceptor: │         │  - Bearer token       │
│  - Bearer token      │         │  - X-Organization-ID  │
│  - 30s timeout       │         │  - 15s timeout        │
│  - Body-level log    │         │  - 401 → auto logout  │
└──────────┬───────────┘         └───────────┬───────────┘
           │                                 │
           │     HTTPS (REST API)            │
           │     WSS (WebSocket)             │
           │     SSE (Server-Sent Events)    │
           ▼                                 ▼
┌──────────────────────────────────────────────────────────┐
│              BACKEND API (Vercel Serverless)              │
│                                                          │
│  URL: https://calltrackerpro-backend.vercel.app          │
│                                                          │
│  ┌────────────┐  ┌───────────┐  ┌────────────────────┐  │
│  │ REST API   │  │ SSE       │  │ WebSocket          │  │
│  │            │  │ Streams   │  │ (wss://...//ws)    │  │
│  │ /api/auth  │  │           │  │                    │  │
│  │ /api/tix   │  │ /call-logs│  │ Events:            │  │
│  │ /api/calls │  │   /stream │  │ - ticket-created   │  │
│  │ /api/orgs  │  │           │  │ - ticket-updated   │  │
│  │ /api/users │  │ /tickets  │  │ - user-status      │  │
│  │ /api/teams │  │   /stream │  │ - call-logged      │  │
│  │ etc.       │  │           │  │ - dashboard-refresh │  │
│  └─────┬──────┘  └───────────┘  └────────────────────┘  │
│        │                                                 │
└────────┼─────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────┐     ┌──────────────────────────┐
│    MongoDB Atlas    │     │   Supabase PostgreSQL    │
│                     │     │                          │
│  Collections:       │     │  Tables (with RLS):      │
│  - users            │     │  - organizations         │
│  - organizations    │     │  - users                 │
│  - tickets          │     │  - teams                 │
│  - calllogs         │     │  - contacts              │
│  - contacts         │     │  - call_logs             │
│  - teams            │     │  - tickets               │
│  - notifications    │     │  - notifications         │
│  - invitations      │     │                          │
│  - tickethistories  │     │                          │
│  - ticketnotes      │     │                          │
└────────────────────┘     └──────────────────────────┘
```

### 6.2 Critical Data Flows

#### Flow 1: Call Tracking (Android → Backend → DB)

```
1. Phone rings / User dials out
2. Android CallReceiver detects PHONE_STATE_CHANGED
3. CallReceiverService starts foreground service
4. EnhancedCallService.handleCallStarted()
   └─▶ GET /api/call-logs/history/{phoneNumber}
       └─▶ Returns caller history & existing tickets
5. Call ends (IDLE state)
6. EnhancedCallService.handleCallEnded()
   └─▶ POST /api/call-logs/with-ticket
       Body: { phoneNumber, duration, callType, contactName }
       └─▶ Backend creates CallLog document
       └─▶ Backend auto-creates Ticket (if configured)
       └─▶ Returns { callLog, ticket }
7. TicketPopupReceiver shows overlay with new ticket
8. SSE stream broadcasts CALL_LOG_CREATED to connected clients
9. Web Dashboard receives SSE event → updates call log table
```

#### Flow 2: Authentication (Both Clients → Backend)

```
1. Client sends POST /api/auth/login { email, password }
2. Backend:
   a. Find user by email in MongoDB
   b. Compare password hash (bcryptjs)
   c. Generate JWT (7-day expiry, contains userId + role)
   d. Return { token, user, expiresIn }
3. Android: TokenManager stores in SharedPreferences
   Web: localStorage stores authToken + user JSON
4. All subsequent requests include:
   Header: Authorization: Bearer <jwt_token>
5. auth middleware verifies token on every protected route
6. multiTenantAuth middleware scopes data to user's organization
```

#### Flow 3: Ticket Lifecycle (Web Dashboard)

```
1. Agent creates ticket: POST /api/tickets
   └─▶ Status: "open", assigned to agent
2. SSE broadcasts "ticket-created" to org members
3. Agent works ticket: PUT /api/tickets/:id
   └─▶ Status: "in_progress"
4. Agent adds notes: POST /api/tickets/:id/notes
5. Manager reassigns: POST /api/tickets/:id/assign
6. SLA timer tracks due date
   └─▶ If breached: escalation triggered
7. Agent resolves: POST /api/tickets/:id/resolve
   └─▶ Status: "resolved"
8. All changes logged in TicketHistory
```

#### Flow 4: Organization Switching (Multi-Tenant)

```
1. User logs in → receives user.organizations[] array
2. If multiple orgs:
   Android: OrganizationSelectorActivity shown
   Web: OrganizationSwitcher component in sidebar
3. User selects organization
4. Token context updated:
   Android: TokenManager.setCurrentOrganization()
   Web: localStorage.currentOrganization = { _id, name }
5. All API calls now scoped:
   Android: ?organization_id=xxx query param
   Web: X-Organization-ID header
6. Backend filters all queries by organizationId
7. Dashboard refreshes with org-specific data
```

---

## 7. Authentication & Authorization Flow

### 7.1 JWT Token Flow

```
┌───────────┐     POST /auth/login       ┌──────────┐
│  Client   │ ──────────────────────────▶ │ Backend  │
│           │   { email, password }       │          │
│           │                             │  1. Find user by email
│           │                             │  2. bcrypt.compare(password)
│           │                             │  3. jwt.sign({ userId, role })
│           │ ◀────────────────────────── │          │
│           │   { token, user, expiresIn }│          │
│           │                             └──────────┘
│  Store    │
│  token    │     GET /api/tickets        ┌──────────┐
│           │ ──────────────────────────▶ │ Backend  │
│           │   Authorization:            │          │
│           │   Bearer <token>            │  4. jwt.verify(token)
│           │                             │  5. req.user = decoded
│           │                             │  6. Check role/permissions
│           │ ◀────────────────────────── │  7. Filter by org scope
│           │   { data: [...] }           │          │
└───────────┘                             └──────────┘
```

### 7.2 Middleware Chain

```
auth(req, res, next)
  │ Verify JWT → attach req.user
  ▼
checkRole('manager', 'org_admin', 'super_admin')
  │ Verify user.role is in allowed list
  ▼
checkPermission('canManageUsers')
  │ Check user's permission array
  ▼
checkOrganizationAccess(orgId)
  │ Verify user belongs to requested org
  ▼
applyDataScope(req)
  │ Filter query by: super_admin=all, org_admin=org, manager=team, agent=self
  ▼
Route Handler
```

---

## 8. Multi-Tenancy Model

### 8.1 Tenant Hierarchy

```
Platform (CallTracker Pro)
  │
  ├── Organization A (Subscription: Pro)
  │     ├── Team Sales
  │     │     ├── Manager: John
  │     │     ├── Agent: Alice
  │     │     └── Agent: Bob
  │     ├── Team Support
  │     │     ├── Manager: Sarah
  │     │     └── Agent: Charlie
  │     └── Org Admin: Mike
  │
  ├── Organization B (Subscription: Business)
  │     ├── Team Alpha
  │     └── Team Beta
  │
  └── Super Admin: admin@calltrackerpro.com
        (can access all organizations)
```

### 8.2 Data Scoping Rules

| Role | Can See | Scope Filter |
|------|---------|-------------|
| `super_admin` | All orgs, all data | No filter |
| `org_admin` | Own organization only | `organizationId = user.orgId` |
| `manager` | Own team(s) data | `teamId IN user.teamIds` |
| `agent` | Own assigned data | `assignedTo = user.id` |
| `viewer` | Own org (read-only) | `organizationId = user.orgId` |

### 8.3 Subscription Tiers

| Feature | Free | Pro | Business | Enterprise |
|---------|------|-----|----------|------------|
| Users | 3 | 25 | 100 | 999 |
| Calls/month | 500 | 10,000 | 100,000 | 999,999 |
| Contacts | 100 | 5,000 | 50,000 | Unlimited |
| Teams | 1 | 5 | 20 | Unlimited |
| Call Recording | No | Yes | Yes | Yes |
| Advanced Analytics | No | No | Yes | Yes |
| API Access | No | No | Yes | Yes |
| Custom Branding | No | No | No | Yes |

---

## 9. Real-Time Communication

### 9.1 Server-Sent Events (SSE)

SSE is used for **server-to-client push** of live updates:

```
┌──────────┐    GET /api/call-logs/stream     ┌──────────┐
│  Client  │ ──────────────────────────────▶  │ Backend  │
│          │    Accept: text/event-stream     │          │
│          │                                  │          │
│          │ ◀─── data: {"type":"CALL_LOG_CREATED",...}
│          │ ◀─── data: {"type":"CALL_ANALYTICS_UPDATED",...}
│          │ ◀─── :heartbeat (every 30s)      │          │
│          │                                  │          │
└──────────┘    Persistent Connection          └──────────┘

Streams Available:
  - /api/call-logs/stream  → Call log events
  - /api/tickets/stream    → Ticket events
  - /api/notifications/stream → Notification events
```

### 9.2 WebSocket (Android App)

```
┌──────────────┐    wss://...//ws?token=...     ┌──────────┐
│  Android     │ ◀──────────────────────────▶   │ Backend  │
│  WebSocket   │    Bidirectional                │          │
│  Manager     │                                │          │
│              │    Events by role:              │          │
│              │    super_admin: ALL events      │          │
│              │    org_admin: org, tickets,     │          │
│              │               users, analytics │          │
│              │    manager: tickets, team,      │          │
│              │             user_status         │          │
│              │    agent: tickets, calls,       │          │
│              │           assignments           │          │
└──────────────┘                                └──────────┘

Reconnection: Up to 5 attempts, 5-second intervals
```

---

## 10. Data Models & Relationships

### 10.1 Entity Relationship Diagram

```
┌──────────────┐      belongs to       ┌──────────────────┐
│     User     │ ────────────────────▶ │   Organization   │
│              │                       │                  │
│  id          │  ┌─ member of ──────▶ │  id              │
│  email       │  │                    │  name            │
│  firstName   │  │                    │  subscription    │
│  lastName    │  │                    │  userLimit       │
│  role        │  │                    │  callLimit       │
│  phone       │  │                    │  settings        │
│  orgId ──────┼──┘                    │  billing         │
│  teamIds[]───┼──┐                    └────────┬─────────┘
│  permissions │  │                             │
└──────┬───────┘  │                    has many  │
       │          │                             ▼
       │          │  ┌─────────────────────────────┐
       │          └─▶│         Team                │
       │             │                             │
  assigned to        │  id                         │
       │             │  name                       │
       │             │  organizationId             │
       ▼             │  managerId ─────▶ User      │
┌──────────────┐     │  members[] ─────▶ User[]    │
│   Ticket     │     │  targets                    │
│              │     └─────────────────────────────┘
│  id          │
│  status      │ ◀─── created from ───┐
│  priority    │                      │
│  assignedTo──┼──▶ User              │
│  orgId       │                      │
│  teamId      │               ┌──────┴───────┐
│  contactId───┼──▶ Contact    │   CallLog     │
│  callLogId───┼──▶ CallLog    │              │
│  slaStatus   │               │  id           │
│  dueDate     │               │  phoneNumber  │
│  category    │               │  callType     │
│  notes[]     │               │  duration     │
│  history[]   │               │  contactName  │
└──────────────┘               │  userId ──▶ User
                               │  orgId       │
┌──────────────┐               │  sentiment   │
│   Contact    │               │  transcription│
│              │               │  leadStatus   │
│  id          │ ◀── linked ───┤  tags[]       │
│  firstName   │               └──────────────┘
│  lastName    │
│  email       │
│  phone       │
│  company     │
│  status      │  (new → qualified → converted/lost)
│  orgId       │
│  assignedTo──┼──▶ User
│  teamId      │
│  tags[]      │
│  notes[]     │
└──────────────┘

┌──────────────┐         ┌──────────────────┐
│ TicketNote   │         │  TicketHistory   │
│              │         │                  │
│  ticketId ───┼──▶ Tix  │  ticketId ──▶ Tix│
│  authorId ───┼──▶ User │  changedBy ──▶ Us│
│  content     │         │  field           │
│  createdAt   │         │  oldValue        │
└──────────────┘         │  newValue        │
                         └──────────────────┘

┌──────────────┐
│  Invitation  │
│              │
│  email       │
│  orgId ──────┼──▶ Organization
│  role        │
│  invitedBy ──┼──▶ User
│  status      │  (pending/accepted/expired)
└──────────────┘
```

### 10.2 Key Model Fields

| Model | Key Fields | Indexes |
|-------|-----------|---------|
| **User** | email (unique), role, organizationId, teamIds[], permissions[], callCount, callLimit, isActive | email, organizationId |
| **Organization** | name, domain, subscription.{plan,status,userLimit,callLimit}, settings, billing.{stripeId,razorpayId} | name |
| **Ticket** | status, priority, assignedTo, organizationId, teamId, contactId, callLogId, slaStatus, dueDate, category | status+orgId, assignedTo, dueDate |
| **CallLog** | phoneNumber, callType, duration, timestamp, userId, organizationId, sentiment, transcription, leadStatus | userId+timestamp, phoneNumber, orgId |
| **Contact** | firstName, lastName, phone, email, company, status, organizationId, assignedTo, teamId, tags[] | phone, email, orgId |
| **Team** | name, organizationId, managerId, members[{userId,role}], targets, analytics | orgId |

---

## 11. Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                         │
│                                                                  │
│  ┌─────────────────────┐     ┌──────────────────────────────┐   │
│  │     Netlify          │     │        Vercel                │   │
│  │                      │     │                              │   │
│  │  Web Dashboard       │     │  Backend API                 │   │
│  │  (React SPA)         │     │  (Serverless Functions)      │   │
│  │                      │     │                              │   │
│  │  Build: npm run build│     │  Entry: api/index.js         │   │
│  │  Publish: /build     │     │  Rewrites: /* → /api/index   │   │
│  │  SPA: /* → index.html│     │                              │   │
│  │                      │     │  URL: calltrackerpro-        │   │
│  │  Env:                │     │       backend.vercel.app     │   │
│  │  REACT_APP_API_URL   │     │                              │   │
│  │  REACT_APP_ENV       │     │  Env:                        │   │
│  └─────────────────────┘     │  MONGODB_URI                 │   │
│                               │  SUPABASE_URL                │   │
│  ┌─────────────────────┐     │  SUPABASE_SERVICE_ROLE_KEY   │   │
│  │   Google Play /      │     │  JWT_SECRET                  │   │
│  │   Direct APK         │     │  SENDGRID_API_KEY           │   │
│  │                      │     └──────────────────────────────┘   │
│  │  Android App         │                                        │
│  │  Min SDK: 24         │     ┌──────────────────────────────┐   │
│  │  Target SDK: 34      │     │  MongoDB Atlas               │   │
│  │                      │     │  (Cloud Database)             │   │
│  │  Firebase Project:   │     └──────────────────────────────┘   │
│  │  calltracker-pro-    │                                        │
│  │  android             │     ┌──────────────────────────────┐   │
│  └─────────────────────┘     │  Supabase                    │   │
│                               │  (PostgreSQL + Auth + RLS)    │   │
│                               └──────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────┐     ┌──────────────────────────────┐   │
│  │  SendGrid            │     │  Firebase                    │   │
│  │  (Email Service)     │     │  (Push Notifications, future)│   │
│  └─────────────────────┘     └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 12. API Endpoint Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user + auto-create org |
| POST | `/api/auth/login` | No | Login, returns JWT token |
| POST | `/api/auth/logout` | Yes | Clear session |
| POST | `/api/auth/refresh` | Yes | Refresh JWT token |
| GET | `/api/auth/me` | Yes | Get current user profile |

### Tickets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tickets` | Yes | List tickets (filtered by role scope) |
| POST | `/api/tickets` | Yes | Create new ticket |
| GET | `/api/tickets/:id` | Yes | Get ticket details |
| PUT | `/api/tickets/:id` | Yes | Update ticket |
| POST | `/api/tickets/:id/assign` | Yes | Assign ticket to user |
| POST | `/api/tickets/:id/resolve` | Yes | Mark ticket resolved |
| PUT | `/api/tickets/:id/status` | Yes | Update ticket status |
| GET | `/api/tickets/:id/notes` | Yes | Get ticket notes |
| POST | `/api/tickets/:id/notes` | Yes | Add note to ticket |
| GET | `/api/tickets/stats` | Yes | Ticket statistics |
| GET | `/api/tickets/stream` | Yes | SSE real-time stream |

### Call Logs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/call-logs` | Yes | List call logs |
| POST | `/api/call-logs` | Yes | Create call log |
| POST | `/api/call-logs/with-ticket` | Yes | Create call log + auto-ticket |
| GET | `/api/call-logs/history/:phone` | Yes | Call history for phone number |
| GET | `/api/call-logs/analytics/stats` | Yes | Call analytics & trends |
| GET | `/api/call-logs/stream` | Yes | SSE real-time stream |

### Contacts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/contacts` | Yes | List contacts |
| POST | `/api/contacts` | Yes | Create contact |
| PUT | `/api/contacts/:id` | Yes | Update contact |
| DELETE | `/api/contacts/:id` | Yes | Delete contact |
| POST | `/api/contacts/:id/interactions` | Yes | Add interaction |
| PUT | `/api/contacts/:id/assign` | Yes | Assign contact |

### Organizations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/organizations` | Yes | List user's organizations |
| GET | `/api/organizations/:id` | Yes | Get org details |
| PUT | `/api/organizations/:id` | Yes | Update org settings |
| GET | `/api/organizations/:id/users` | Yes | Get org members |
| GET | `/api/organizations/:id/analytics` | Yes | Org analytics |

### Super Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/super-admin/dashboard` | SA | Platform overview stats |
| GET | `/api/super-admin/organizations` | SA | All organizations |
| POST | `/api/super-admin/organizations` | SA | Create organization |
| PUT | `/api/super-admin/organizations/:id` | SA | Update organization |
| DELETE | `/api/super-admin/organizations/:id` | SA | Delete organization |
| GET | `/api/super-admin/users` | SA | All users |
| POST | `/api/super-admin/users` | SA | Create user |
| PUT | `/api/super-admin/users/:id` | SA | Update user |
| DELETE | `/api/super-admin/users/:id` | SA | Delete user |
| GET | `/api/super-admin/stats` | SA | Platform statistics |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Yes | Get all notifications |
| GET | `/api/notifications/unread` | Yes | Unread count |
| PUT | `/api/notifications/:id/read` | Yes | Mark as read |
| GET | `/api/notifications/stream` | Yes | SSE notification stream |

### Teams
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/teams` | Yes | List teams |
| POST | `/api/teams` | Yes | Create team |
| PUT | `/api/teams/:id` | Yes | Update team |
| DELETE | `/api/teams/:id` | Yes | Delete team |
| GET | `/api/teams/:id/members` | Yes | Get team members |
| POST | `/api/teams/:id/members/:userId` | Yes | Add member |
| DELETE | `/api/teams/:id/members/:userId` | Yes | Remove member |

### Demo Requests
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/demo-requests` | No | Submit demo request |
| GET | `/api/demo-requests` | SA | List demo requests |
| GET | `/api/demo-requests/analytics` | SA | Demo analytics |

### Health & Debug
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | API info + endpoint list |
| GET | `/health` | No | Server health status |
| GET | `/api/test` | No | Simple test endpoint |
| GET | `/api/cors-test` | No | CORS config test |

> **SA** = Super Admin only

---

## 13. Role-Based Access Control Matrix

### 13.1 Dashboard Views

| Feature | super_admin | org_admin | manager | agent | viewer |
|---------|:-----------:|:---------:|:-------:|:-----:|:------:|
| Platform Overview | Yes | - | - | - | - |
| All Organizations | Yes | - | - | - | - |
| Organization Dashboard | Yes | Yes | - | - | - |
| Team Dashboard | Yes | Yes | Yes | - | - |
| Agent Dashboard | Yes | Yes | Yes | Yes | - |
| Read-Only Dashboard | Yes | Yes | Yes | Yes | Yes |

### 13.2 Feature Permissions

| Permission | super_admin | org_admin | manager | agent | viewer |
|-----------|:-----------:|:---------:|:-------:|:-----:|:------:|
| View All Tickets | Yes | Yes | Yes | Yes | Yes |
| Create Tickets | Yes | Yes | Yes | Yes | - |
| Edit Tickets | Yes | Yes | Yes | Yes | - |
| Delete Tickets | Yes | Yes | Yes | - | - |
| Assign Tickets | Yes | Yes | Yes | - | - |
| View Call Logs | Yes | Yes | Yes | Yes | Yes |
| Create Call Logs | Yes | Yes | Yes | Yes | - |
| View Analytics | Yes | Yes | Yes | - | - |
| Export Data | Yes | Yes | Yes | - | - |
| Manage Users | Yes | Yes | - | - | - |
| Manage Teams | Yes | Yes | Yes | - | - |
| Manage Organization | Yes | Yes | - | - | - |
| Manage All Orgs | Yes | - | - | - | - |
| View Leads/Demos | Yes | - | - | - | - |
| System Settings | Yes | - | - | - | - |

### 13.3 Data Visibility Scope

```
super_admin ──▶ ALL organizations, ALL data (platform-wide)
org_admin ─────▶ Own organization only, ALL data within org
manager ───────▶ Own team(s) data, team member activities
agent ─────────▶ Own assigned tickets, own call logs, own contacts
viewer ────────▶ Read-only access to org tickets and call logs
```

---

## Summary

CallTracker Pro is a **3-tier multi-tenant SaaS platform** with:

- **Android App** as the data collection layer (automatic call tracking via BroadcastReceivers + foreground services)
- **Express.js Backend** as the API + business logic layer (JWT auth, RBAC, dual-database, SSE/WebSocket)
- **React Web Dashboard** as the management/analytics layer (CRM, Kanban, reporting, admin panel)

All three systems connect through a centralized REST API deployed on Vercel, with real-time capabilities via SSE and WebSocket for live updates across all connected clients.
