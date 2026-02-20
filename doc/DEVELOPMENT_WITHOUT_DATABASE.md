# CALLpro - What Can Be Developed Without Database
**Date:** 2026-02-20

---

## Summary

```
WITHOUT Database:  ~40% of remaining work (25-30 tasks)
WITH Database:     ~60% of remaining work (15-20 tasks)
```

---

## 1. Web Dashboard - No Database Needed

### High Impact (Build First)

| # | Task | Effort | Impact | Details |
|---|---|---|---|---|
| 1 | **Kanban Board page** | Medium | HIGH | Drag-drop UI with `@dnd-kit` (already installed). Use mock ticket data. Replace "Coming Soon" placeholder |
| 2 | **CRM Analytics page** | Medium | HIGH | Charts with `recharts` (already installed). Use mock data. Replace "Coming Soon" placeholder |
| 3 | **WhatsApp button on ticket/call pages** | Small | HIGH | No backend needed. Just `window.open('https://wa.me/${phoneNumber}')`. Critical for Indian retail |
| 4 | **Fix Headless UI v2 compatibility** | Small | MEDIUM | Header.jsx still uses `Menu.Button`, `Menu.Items`, `Menu.Item` (v1 API). Needs migration to v2 |
| 5 | **Client-side CSV export** | Small | MEDIUM | Generate CSV from already-loaded table data in browser. No backend endpoint needed |
| 6 | **Dashboard stat % calculation** | Small | MEDIUM | Replace hardcoded "+12%", "-5%" with real calculation from fetched data |
| 7 | **Improve ticket create form** | Small | HIGH | Pre-defined interest levels, outcomes, product categories as chips/buttons (4-5 click flow for retail) |
| 8 | **Mobile responsive sidebar** | Small | MEDIUM | Fix sidebar breakpoint handling for tablet/mobile views |

### Medium Impact

| # | Task | Effort | Impact | Details |
|---|---|---|---|---|
| 9 | Profile page UI completion | Small | LOW | Currently basic, add avatar upload UI, settings |
| 10 | Notification page improvements | Small | LOW | Better UI for mock notifications list |
| 11 | Ticket detail - notes UI section | Small | MEDIUM | Build the notes input/display UI. Will connect to backend later |
| 12 | Ticket detail - history timeline UI | Small | MEDIUM | Build the audit trail timeline component. Will connect later |
| 13 | Organization settings form | Small | LOW | Load existing values into form (currently hardcoded defaults) |
| 14 | Search functionality | Medium | MEDIUM | Client-side search across loaded tickets/calls/users |
| 15 | Error boundary components | Small | MEDIUM | Catch React errors gracefully instead of white screen |
| 16 | Empty state illustrations | Small | LOW | Better empty state visuals for pages with no data |

---

## 2. Backend - No Database Needed

### Critical (Security Fixes)

| # | Task | Effort | Impact | Details |
|---|---|---|---|---|
| 17 | **Remove `/api/reset-super-admin`** | Tiny | CRITICAL | Resets password for hardcoded email in production |
| 18 | **Remove `/api/debug/token`** | Tiny | CRITICAL | Exposes token debugging in production |
| 19 | **Remove `/reset-password` unprotected endpoint** | Tiny | CRITICAL | Another unprotected password reset |
| 20 | **Fix CORS configuration** | Small | HIGH | Replace wildcard `*` with specific allowed origins |

### Code Structure (No DB Writes)

| # | Task | Effort | Impact | Details |
|---|---|---|---|---|
| 21 | **Shared auth middleware** | Small | HIGH | Extract duplicated inline `supabaseAuth` middleware into single shared file |
| 22 | **Route handler skeletons** | Medium | HIGH | Create all 30+ missing endpoint handlers. Return proper 501 "Not Implemented" instead of 404 |
| 23 | **SLA calculation logic** | Small | MEDIUM | Pure business logic function: given `createdAt`, `priority`, calculate `slaDeadline` and `slaStatus` |
| 24 | **Round-robin assignment algorithm** | Small | MEDIUM | Pure logic: given team members array, return next assignee. No DB needed for the algorithm itself |
| 25 | **Input validation schemas** | Medium | MEDIUM | Define validation rules for all endpoints (can use joi or express-validator) |
| 26 | **Remove legacy MongoDB routes** | Small | MEDIUM | Clean up unused route imports from `app.js` |
| 27 | **API response standardization** | Small | MEDIUM | Consistent `{ success, data, message, error }` format across all endpoints |

---

## 3. Android App - No Database Needed

| # | Task | Effort | Impact | Details |
|---|---|---|---|---|
| 28 | **Remove hardcoded test credentials** | Tiny | CRITICAL | `anas@anas.com` / `Anas@1234` in LoginActivity.java |
| 29 | **Simplify TicketPopupActivity** | Medium | HIGH | Reduce to 3-4 taps: Interest (Hot/Warm/Cold) → Outcome → Quick note → Save |
| 30 | **WhatsApp intent integration** | Small | HIGH | `Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/$phone"))` on ticket/call screens |
| 31 | **Pre-defined quick notes** | Small | HIGH | Chip buttons: "Wants pricing", "Will visit store", "Needs demo", "Follow up tomorrow" |
| 32 | **UI polish** | Medium | MEDIUM | Consistent colors, spacing, loading states across all fragments |

---

## 4. CANNOT Build Without Database

These tasks require Supabase tables and queries:

### Need New Supabase Tables

| Task | Table Needed | Why |
|---|---|---|
| Ticket notes CRUD | `ticket_notes` | Store notes per ticket with author, timestamp |
| Audit/history logging | `ticket_history` | Store field changes with old/new values |
| Real notification system | `notifications` | Store notifications per user, read/unread status |
| Contacts management | `contacts` (if not exists in Supabase) | Store customer contact profiles |
| Team management | `teams`, `team_members` | Store team structure for assignment |

### Need Supabase Queries on Existing Tables

| Task | Tables Used | Why |
|---|---|---|
| `/api/auth/me` endpoint | `users` | Fetch current user by ID from JWT |
| `/api/auth/refresh` endpoint | `users` | Validate user still exists, generate new JWT |
| Ticket delete endpoint | `tickets` | DELETE query |
| Super admin update (PUT orgs) | `organizations` | UPDATE query |
| Super admin update (PUT users) | `users` | UPDATE query |
| Analytics aggregation APIs | `tickets`, `call_logs` | COUNT, GROUP BY, SUM queries |
| Pipeline analytics | `tickets` | GROUP BY stage, calculate conversion rates |
| SLA breach detection | `tickets` | Query overdue tickets, UPDATE sla_status |
| Organization analytics | `tickets`, `call_logs`, `users` | Aggregate stats per org |
| Call log deletion | `call_logs` | DELETE query |
| My tickets filter | `tickets` | WHERE assigned_to = current_user |
| Overdue tickets filter | `tickets` | WHERE next_follow_up < NOW() |

### Need Real-Time Infrastructure

| Task | Requirement | Why |
|---|---|---|
| SSE event streaming | SSE endpoint on Express | Push new calls/tickets to web dashboard |
| WebSocket server | ws/socket.io server | Bi-directional real-time communication |
| Push notifications (Android) | Firebase Cloud Messaging | Send alerts to agents' phones |
| Live dashboard updates | SSE/WS + DB triggers | Auto-refresh without page reload |

---

## 5. Recommended Build Order (No Database Phase)

### Sprint 1: Security + Cleanup (1-2 hours)
```
✅ Remove debug/security endpoints (backend)
✅ Remove hardcoded test credentials (Android)
✅ Fix CORS configuration
✅ Extract shared auth middleware
✅ Remove legacy MongoDB route imports
```

### Sprint 2: High-Impact UI Pages (4-6 hours)
```
✅ Build Kanban Board page with mock data
✅ Build CRM Analytics page with mock charts
✅ Add WhatsApp buttons (web + Android)
✅ Fix Headless UI v2 in Header.jsx
✅ Client-side CSV export
```

### Sprint 3: UX Improvements (3-4 hours)
```
✅ Simplify ticket create form (4-5 clicks)
✅ Simplify Android TicketPopupActivity (3-4 taps)
✅ Pre-defined quick notes/dispositions
✅ Calculate real dashboard stat percentages
✅ Add error boundaries
```

### Sprint 4: Backend Structure (2-3 hours)
```
✅ Route handler skeletons for all missing endpoints
✅ SLA calculation logic (pure function)
✅ Round-robin assignment algorithm (pure function)
✅ Input validation schemas
✅ API response standardization
```

**Total estimated: ~10-15 hours of work without touching the database.**

---

## 6. After Database Phase

Once Supabase is connected:
1. Wire route skeletons to actual Supabase queries
2. Create missing tables (`ticket_notes`, `ticket_history`, `notifications`, `teams`)
3. Enable Row Level Security (RLS) for multi-tenant data isolation
4. Replace mock data in Kanban/Analytics with real API calls
5. Implement SSE endpoint for real-time updates
6. Set up cron/scheduled function for SLA breach detection

---

*Generated by CALLpro Development Analysis - February 2026*
