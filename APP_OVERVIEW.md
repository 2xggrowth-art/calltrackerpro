# CallTracker Pro - App Overview

> **Version:** 1.0.0 | **Platform:** Android (Min SDK 24) + Web Dashboard + Backend API
> **Last Updated:** February 19, 2026

---

## What is CallTracker Pro?

CallTracker Pro is a **multi-tenant SaaS platform** for automatic call tracking, CRM, and ticket management. It is designed for businesses that rely heavily on phone calls — such as sales teams, customer support centers, BPOs, and service-based companies.

The system consists of three interconnected components:

| Component | Technology | Deployment |
|-----------|-----------|------------|
| Android App | Java, Android SDK 34 | Google Play / Direct APK |
| Backend API | Node.js, Express.js | Vercel (Serverless) |
| Web Dashboard | React 19, Tailwind CSS | Netlify |

**The core idea:** Every phone call is automatically intercepted, logged, and converted into an actionable CRM ticket — without the agent lifting a finger.

---

## Key Features

### 1. Automatic Call Tracking
- Intercepts all incoming, outgoing, and missed calls in real-time
- Runs as a foreground service — works even when the app is in background
- Detects call state transitions: Ringing → Answered → Ended
- Persists across device reboots via Boot Receiver
- No manual logging required from agents

### 2. Auto-Ticket Creation
- Every call automatically generates a CRM ticket on the backend
- A popup overlay appears immediately after the call ends, showing ticket details
- Caller history and related tickets are fetched during the call for agent reference
- Tickets include phone number, contact name, duration, call type, and timestamps

### 3. CRM & Ticket Management
- Full ticket lifecycle: Open → In Progress → Resolved → Closed
- Priority levels: Low, Medium, High, Urgent
- SLA tracking with due dates and breach detection
- Ticket assignment, escalation, and reassignment
- Notes and activity history on every ticket
- Advanced filtering: by status, priority, assignee, date range, and search
- Tab-based quick views: All, My Tickets, Open, In Progress, High Priority, Overdue

### 4. CRM Pipeline (Kanban Board)
- Visual drag-and-drop Kanban board on the Web Dashboard
- Pipeline stages: Prospect → Qualified → Proposal → Negotiation → Closed Won / Closed Lost
- Lead status tracking: New → Contacted → Qualified → Converted → Closed
- Deal value tracking per ticket/lead

### 5. Contact Management
- Create and manage contacts/leads with full details
- Link contacts to call logs and tickets automatically
- Contact status progression: New → Qualified → Converted / Lost
- Tags, notes, and interaction history per contact
- Assign contacts to agents or teams

### 6. Role-Based Dashboards (5 Roles)
| Role | What They See |
|------|--------------|
| **Super Admin** | Platform-wide overview — all organizations, all users, all data |
| **Org Admin** | Full organization management — users, teams, settings, analytics |
| **Manager** | Team performance — team analytics, ticket assignment, team management |
| **Agent** | Personal workspace — own calls, own tickets, contacts, create tickets |
| **Viewer** | Read-only access — can view org tickets and call logs but cannot edit |

### 7. Multi-Organization Support
- Users can belong to multiple organizations
- Organization selector on login when multiple orgs are available
- All data is scoped per organization — complete tenant isolation
- Subscription tiers control user limits, call limits, and feature access

### 8. Subscription Tiers
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

### 9. Real-Time Updates
- **Server-Sent Events (SSE)** for live ticket and call log streams
- **WebSocket** for bidirectional real-time communication on Android
- Role-based event subscriptions — agents get call/ticket events, admins get everything
- Auto-reconnect with retry logic (up to 5 attempts)

### 10. Analytics & Reporting
- **Individual Analytics** — agent performance, call count, ticket resolution rate
- **Team Analytics** — team metrics, member comparison, targets vs actuals
- **Organization Analytics** — org-wide KPIs, trends, SLA compliance
- **Platform Analytics** (Super Admin) — cross-organization statistics

### 11. User & Team Management
- Invite users via email with role assignment
- Create teams with managers and members
- Set team targets and track performance
- Activate/deactivate users
- Fine-grained permissions beyond role defaults

### 12. Notifications
- 4 notification channels: Tickets, Assignments, Reminders, System
- In-app notification center with read/unread tracking
- Real-time notification delivery via SSE
- Push notification infrastructure (Firebase — planned)

---

## Benefits

### For Sales Teams
- **Zero manual data entry** — every call is automatically logged and ticketed
- **Never lose a lead** — missed calls create tickets that demand follow-up
- **Pipeline visibility** — Kanban board shows deal progress at a glance
- **Performance tracking** — managers see who is calling, closing, and falling behind

### For Customer Support
- **Instant ticket creation** — support tickets from calls appear in real-time
- **SLA compliance** — due dates and breach alerts prevent missed deadlines
- **Full call history** — agents see past interactions before answering a call
- **Escalation workflows** — tickets can be escalated to managers automatically

### For Business Owners / Admins
- **Multi-tenant architecture** — manage multiple business units or clients from one platform
- **Role-based access** — control who sees what with 5 granular roles
- **Analytics dashboards** — understand call volume, team performance, and trends
- **Subscription control** — scale usage with tiered plans

### For IT / Operations
- **Cloud-native deployment** — Vercel (backend) + Netlify (web) + Android
- **Dual database support** — MongoDB (primary) + Supabase PostgreSQL (alternative)
- **JWT-based auth** — secure, stateless authentication
- **Real-time infrastructure** — SSE + WebSocket for live data across all clients

---

## Current Condition of the App

### What is Working (Implemented)

| Area | Status | Details |
|------|--------|---------|
| Authentication | Working | Login, registration (2-step), session management, JWT tokens |
| Call Interception | Working | Incoming/outgoing/missed call detection via BroadcastReceiver |
| Auto Call Logging | Working | Calls are POSTed to backend with auto-ticket creation |
| Ticket Popup | Working | Overlay popup appears after each call with ticket info |
| Ticket Management | Working | Full CRUD, filtering, search, assign, escalate, notes, status updates |
| Role-Based Dashboards | Working | 5 role-specific dashboard views with proper routing |
| Multi-Org Support | Partial | Organization selection works but auto-selects first org instead of showing picker |
| Call Logs Display | Working | Reads device call history + API fallback, with action options |
| Contact Management | Working | CRUD with assignment and linking |
| WebSocket Real-Time | Working | Bidirectional WS with role-based event subscriptions and reconnect |
| SSE Streaming | Working | Live ticket and call log event streams |
| User Management | Working | Invite, update roles, activate/deactivate |
| Team Management | Working | Create/edit teams, manage members |
| Analytics Fragments | Working | Individual, team, and org analytics UI in place |
| Notifications | Partial | Channels and display working; polling logic is a stub |
| API Integration | Working | 50+ endpoints defined, Retrofit client configured |
| Boot Persistence | Working | Call tracking re-enables after device reboot |

### What Needs Work (Known Issues)

| Issue | Severity | Details |
|-------|----------|---------|
| Call duration always 0 | High | `CallReceiver` hardcodes `duration = 0` — timing logic between OFFHOOK and IDLE is not implemented |
| Notification polling stub | Medium | `NotificationService.checkForNewNotifications()` is a placeholder with only a comment |
| Super Admin dashboard empty | Medium | `SuperAdminDashboardFragment` has no custom implementation — inherits generic dashboard |
| Hardcoded test credentials | High | `TestCredentials.java` contains `anas@anas.com` / `Anas@1234` with a "Test Login" button — must be removed before release |
| Full body logging in production | High | `HttpLoggingInterceptor.Level.BODY` logs all JWT tokens and data to logcat |
| ProGuard disabled | Medium | `isMinifyEnabled = false` in release build — APK code is fully readable |
| User-CA trust in network config | Medium | `network_security_config.xml` trusts user-installed certificates — MITM risk |
| Forgot password not implemented | Low | UI string exists but backend endpoint is not built |
| Email verification not implemented | Low | Endpoint defined in `ApiService` but marked as needing backend work |
| Token refresh not implemented | Low | Endpoint defined but not functional |
| Call recording / transcription | Low | `RECORD_AUDIO` permission declared but no implementation exists |
| Firebase push notifications | Low | Architecture mentions it as "future" — not yet integrated |
| Demo mode accessible in production | Medium | Mock login bypass available when DNS fails — needs production gating |

### Development vs Production Readiness

```
Development Status:  ████████████████████░░░░  ~80% Complete
Production Readiness: ███████████░░░░░░░░░░░░  ~50% Ready
```

**To reach production readiness, the following must be addressed:**
1. Fix call duration tracking (core feature)
2. Remove hardcoded test credentials and test login button
3. Disable full body HTTP logging (security)
4. Enable ProGuard for release builds
5. Remove user-CA trust from network security config
6. Gate demo mode behind a build flag or remove it
7. Implement notification polling or replace with push notifications
8. Build out the Super Admin dashboard with platform-wide stats
9. Implement forgot password and email verification flows
10. Add proper error handling and offline queueing for call logs

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Android App | Java, Android SDK 34, ViewBinding |
| Networking | Retrofit 2.9.0, OkHttp 4.11.0, Gson |
| Real-Time | Java-WebSocket 1.5.3, SSE (custom client) |
| UI Components | Material Design 3, RecyclerView, SwipeRefreshLayout |
| Backend | Node.js, Express.js, JWT (jsonwebtoken), bcryptjs |
| Primary Database | MongoDB Atlas (Mongoose ORM) |
| Secondary Database | Supabase PostgreSQL (Row-Level Security) |
| Web Dashboard | React 19, Tailwind CSS 3.4, Framer Motion, Recharts |
| Email | SendGrid (production), Nodemailer (dev) |
| Deployment | Vercel (backend), Netlify (web), Google Play (app) |

---

## Architecture at a Glance

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  ANDROID APP    │     │   BACKEND API    │     │  WEB DASHBOARD  │
│  (Java)         │────▶│  (Express.js)    │◀────│  (React 19)     │
│                 │     │                  │     │                 │
│  Call Tracking  │     │  REST API        │     │  CRM / Kanban   │
│  Auto Tickets   │     │  SSE Streams     │     │  Analytics      │
│  Role Dashboards│     │  WebSocket       │     │  Admin Panel    │
│  Notifications  │     │  JWT Auth + RBAC │     │  Landing Page   │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼                         ▼
            ┌──────────────┐         ┌──────────────┐
            │  MongoDB     │         │  Supabase    │
            │  Atlas       │         │  PostgreSQL  │
            └──────────────┘         └──────────────┘
```

---

*CallTracker Pro — Smart Call Logging & CRM*
