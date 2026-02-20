# CALLpro - Developer Task Report
**Date:** 2026-02-20
**From:** Arsalan (Project Owner)
**To:** Dev Team
**Context:** Supabase free tier expired — database is offline. Work on everything that does NOT need the database. Arsalan is setting up a new Supabase instance in parallel.

---

## Rules for This Sprint

1. **DO NOT touch database-dependent code** — no new Supabase queries, no table creation
2. **DO NOT deploy to production** until security fixes in Phase 1 are done
3. **Test everything locally** — backend should start without Supabase (graceful fallback)
4. **Commit each phase separately** — one commit per phase so changes are reviewable
5. **No new npm packages** unless absolutely necessary

---

## Phase 1: SECURITY FIXES (Do This First — Before Anything Else)

**Priority:** CRITICAL
**Estimated Time:** 2-3 hours
**Rule:** DO NOT skip any task in this phase. All are security vulnerabilities.

---

### Task 1.1: Remove `/api/reset-super-admin` endpoint
**File:** `backend/app.js` — Lines 226-308
**Action:** Delete the entire block from the `// TEMPORARY` comment (line 226) through line 308.
**Why:** This endpoint lets anyone reset the super admin password without authentication. Anyone who finds this URL gets full admin access.
**Verify:** After deletion, `curl -X POST http://localhost:5000/api/reset-super-admin` should return 404.

---

### Task 1.2: Remove `/api/debug/token` endpoint
**File:** `backend/app.js` — Lines 311-399
**Action:** Delete the entire block from line 311 through line 399.
**Why:** This endpoint exposes JWT secrets, decoded tokens, and database connection state. It's a full debug panel open to the internet.
**Verify:** `curl http://localhost:5000/api/debug/token` should return 404.

---

### Task 1.3: Remove `/reset-password` endpoint
**File:** `backend/app.js` — Lines 401-405
**Action:** Delete lines 401-405 (the `// TEMPORARY` comment + route handler).
**Also delete:** `backend/reset-password.html` if it exists.
**Why:** Unprotected password reset page.
**Verify:** `curl http://localhost:5000/reset-password` should return 404.

---

### Task 1.4: Fix CORS Configuration
**File:** `backend/app.js` — Lines 69-86
**Current code (BROKEN):**
```js
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Credentials', 'true');  // Invalid with wildcard origin
```
**Replace with:**
```js
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://calltrackerpro.netlify.app',  // production web dashboard
  // Add your actual production domain here
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```
**Action:**
1. Run `npm install cors` in the backend folder
2. Replace the manual CORS middleware (lines 69-86) with the code above
3. Remove the `app.options('*', ...)` preflight handler (lines 78-86) — the `cors` package handles this automatically
**Why:** Wildcard `*` + credentials `true` is invalid per CORS spec AND allows any website to make authenticated API calls.

---

### Task 1.5: Remove Hardcoded Test Credentials (Android)
**File 1:** `app/app/src/main/java/com/calltrackerpro/calltracker/ui/login/LoginActivity.java` — Lines 139-149
**Action:** Remove the test login button handler that auto-fills `anas@anas.com` / `Anas@1234`. Replace with a proper demo mode that uses a clearly labeled demo account OR remove the test login button entirely.

**File 2:** `app/app/src/main/java/com/calltrackerpro/calltracker/utils/TestCredentials.java`
**Action:** Delete this entire file. It contains hardcoded email, password, role, and organization name. Any of these should come from build config or be removed entirely.
**Also:** Search the entire Android codebase for any remaining references to `TestCredentials` and remove them.

---

### Task 1.6: Fix HTTP Logging Level (Android)
**File:** `app/app/src/main/java/com/calltrackerpro/calltracker/utils/RetrofitClient.java` — Lines 21, 58
**Current:** `loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);`
**Change to:**
```java
if (BuildConfig.DEBUG) {
    loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
} else {
    loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.NONE);
}
```
**Why:** `BODY` level logs full request/response bodies INCLUDING auth tokens and passwords. This data appears in logcat and can be read by other apps on rooted devices.
**Apply to both instances** (line 21 and line 58).

---

### Task 1.7: Fix Network Security Config (Android)
**File:** `app/app/src/main/res/xml/network_security_config.xml` — Lines 20-25
**Change:**
```xml
<!-- BEFORE (insecure) -->
<base-config cleartextTrafficPermitted="true">
    <trust-anchors>
        <certificates src="system"/>
        <certificates src="user"/>
    </trust-anchors>
</base-config>

<!-- AFTER (secure) -->
<base-config cleartextTrafficPermitted="false">
    <trust-anchors>
        <certificates src="system"/>
    </trust-anchors>
</base-config>
```
**Why:**
- `certificates src="user"` allows man-in-the-middle attacks via user-installed certificates
- `cleartextTrafficPermitted="true"` allows unencrypted HTTP globally
**Keep** the debug-config section for localhost/emulator (lines 13-18) — that's fine for development.

---

### Task 1.8: Restore Web Authentication (Revert Dev Bypass)
**File 1:** `webdashboard/src/contexts/AuthContext.jsx` — Lines 6-21
**Action:**
- Remove `DEV_MOCK_USER` constant (lines 6-14)
- Change `initialState` (lines 16-21) to:
```js
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};
```

**File 2:** `webdashboard/src/routes/AppRoutes.jsx` — Lines 36-37
**Action:** Restore the authentication guard:
```jsx
{isAuthenticated ? (
  <Route path="/*" element={<DashboardRoutes />} />
) : (
  <Route path="/*" element={<LandingRoutes />} />
)}
```
**Why:** Currently the web dashboard gives full super_admin access to ANYONE who visits the URL. Zero authentication.

---

### Phase 1 Checklist
```
[ ] 1.1 - Removed /api/reset-super-admin
[ ] 1.2 - Removed /api/debug/token
[ ] 1.3 - Removed /reset-password
[ ] 1.4 - Fixed CORS with allowed origins list
[ ] 1.5 - Removed hardcoded test credentials (Android)
[ ] 1.6 - Fixed HTTP logging level (Android)
[ ] 1.7 - Fixed network security config (Android)
[ ] 1.8 - Restored web authentication
[ ] Tested: backend starts without errors
[ ] Tested: web dashboard shows login page (not auto-logged-in)
[ ] Tested: Android app builds successfully
[ ] Committed as: "Phase 1: Security fixes"
```

---

## Phase 2: BACKEND CLEANUP & STRUCTURE (No Database Needed)

**Priority:** HIGH
**Estimated Time:** 3-4 hours
**Why:** This sets up the backend so that when the database is ready, wiring up endpoints is fast.

---

### Task 2.1: Extract Shared Auth Middleware for Supabase
**Current problem:** Auth middleware is copy-pasted inline in 5 out of 6 Supabase route files.

**Duplicated in:**
| File | Auth Location |
|---|---|
| `routes/supabaseNotifications.js` | Lines 4, 22-34 |
| `routes/supabaseSuperAdmin.js` | Lines 38-39 |
| `routes/supabaseCallLogs.js` | Lines 34-35 |
| `routes/supabaseTickets.js` | Lines 19-20 |
| `routes/supabaseOrganizations.js` | Lines 6, 34-50 |

**Action:** Create `middleware/supabaseAuth.js`:
```js
const jwt = require('jsonwebtoken');

const supabaseAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
      organizationName: decoded.organizationName,
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { supabaseAuth, requireRole };
```
Then replace all inline auth in the 5 Supabase route files with:
```js
const { supabaseAuth, requireRole } = require('../middleware/supabaseAuth');
// Use as: router.get('/endpoint', supabaseAuth, handlerFunction);
```

---

### Task 2.2: Remove Dead Legacy Route Imports
**File:** `backend/app.js` — Lines 89-97
**These imports are UNUSED** (Supabase routes replaced them):
```js
// DELETE these lines:
const authRoutes = require('./routes/auth');           // line 90 - replaced by supabaseAuth
const ticketRoutes = require('./routes/tickets');       // line 91 - replaced by supabaseTickets
const callLogRoutes = require('./routes/callLogs');     // line 92 - replaced by supabaseCallLogs
const notificationRoutes = require('./routes/notifications'); // line 93 - replaced by supabaseNotifications
```
**KEEP these** (they're still actively mounted):
```js
const superAdminRoute = require('./routes/superAdmin');           // mounted at /api/users (line 118)
const contactRoutes = require('./routes/contacts');               // mounted at /api/contacts (line 113)
const invitationRoutes = require('./routes/invitations');         // mounted at /api/invitations (line 114)
const demoRequestRoutes = require('./routes/demoRequestsSimplified'); // mounted at /api/demo-requests (line 115)
```
**Verify:** Backend starts without errors after removing unused imports.

---

### Task 2.3: Create Route Handler Skeletons for ALL Missing Endpoints
**Why:** The frontend calls 30+ endpoints that return 404. Return proper 501 "Not Implemented" responses instead so the frontend can handle them gracefully.

**File:** `routes/supabaseAuth.js` — Add these:
```js
router.post('/logout', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
});

router.get('/me', supabaseAuth, (req, res) => {
  // Temporary: return the user info from JWT token
  // This will be replaced with a DB lookup when Supabase is ready
  res.json({ success: true, data: req.user });
});

router.post('/refresh', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Token refresh not implemented yet' });
});

router.post('/forgot-password', (req, res) => {
  res.status(501).json({ success: false, message: 'Password reset not implemented yet' });
});

router.post('/verify-email', (req, res) => {
  res.status(501).json({ success: false, message: 'Email verification not implemented yet' });
});
```

**File:** `routes/supabaseTickets.js` — Add these:
```js
router.delete('/:id', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Ticket deletion not implemented yet' });
});

router.get('/my', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'My tickets filter not implemented yet' });
});

router.get('/overdue', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Overdue tickets not implemented yet' });
});

// Ticket notes
router.get('/:id/notes', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Ticket notes not implemented yet' });
});
router.post('/:id/notes', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Ticket notes not implemented yet' });
});

// Ticket history
router.get('/:id/history', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Ticket history not implemented yet' });
});

// Bulk operations
router.post('/bulk-update', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Bulk update not implemented yet' });
});
router.post('/bulk-archive', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Bulk archive not implemented yet' });
});

// Export
router.get('/export', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Export not implemented yet' });
});

// Assignment & escalation
router.put('/:id/assign', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Ticket assignment not implemented yet' });
});
router.put('/:id/escalate', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Ticket escalation not implemented yet' });
});
router.put('/:id/status', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Status update not implemented yet' });
});
router.put('/:id/stage', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Stage update not implemented yet' });
});
router.put('/:id/satisfaction', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Satisfaction rating not implemented yet' });
});
router.put('/:id/follow-up', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Follow-up scheduling not implemented yet' });
});

// Analytics
router.get('/analytics/pipeline', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Pipeline analytics not implemented yet' });
});
router.get('/analytics/conversion', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Conversion analytics not implemented yet' });
});
router.get('/analytics/sla', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'SLA analytics not implemented yet' });
});
router.get('/by-lead-status', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Tickets by lead status not implemented yet' });
});
```

**File:** `routes/supabaseSuperAdmin.js` — Add:
```js
router.put('/organizations/:id', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Organization update not implemented yet' });
});
router.put('/users/:id', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'User update not implemented yet' });
});
```

**File:** `routes/supabaseCallLogs.js` — Add:
```js
router.delete('/:id', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Call log deletion not implemented yet' });
});
```

**Create new file:** `routes/supabaseTeams.js`:
```js
const express = require('express');
const router = express.Router();
const { supabaseAuth } = require('../middleware/supabaseAuth');

router.get('/', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Teams not implemented yet' });
});
router.post('/', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Team creation not implemented yet' });
});
router.put('/:id', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Team update not implemented yet' });
});
router.delete('/:id', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Team deletion not implemented yet' });
});
router.get('/:id/members', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Team members not implemented yet' });
});
router.post('/:id/members', supabaseAuth, (req, res) => {
  res.status(501).json({ success: false, message: 'Add team member not implemented yet' });
});

module.exports = router;
```
**Mount in `app.js`:** `app.use('/api/teams', require('./routes/supabaseTeams'));`

**Also create:** `routes/supabaseDashboard.js` (same pattern — skeleton endpoints for `/api/dashboard/*`)

---

### Task 2.4: Implement `/api/auth/me` (Temporary — From JWT Only)
**File:** `routes/supabaseAuth.js`
**Note:** The `/api/auth/me` endpoint from Task 2.3 can actually work WITHOUT a database by reading the JWT payload. Both the web dashboard and Android app call this endpoint constantly. The skeleton version above (`res.json({ success: true, data: req.user })`) is good enough to stop the 404 errors until the database is connected.

---

### Task 2.5: Update `.env.example`
**File:** `backend/.env.example`
**Replace contents with:**
```env
# Server
PORT=5000
NODE_ENV=development

# Database - MongoDB (legacy, being migrated)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calltrackerpro

# Database - Supabase (primary)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Auth
JWT_SECRET=your-jwt-secret-min-32-chars

# Email (optional)
SENDGRID_API_KEY=your-sendgrid-key
```

---

### Task 2.6: Add Input Validation Middleware
**Install:** `npm install express-validator`
**Create:** `middleware/validate.js`
```js
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { validate };
```
**Create:** `middleware/validators/authValidators.js`
```js
const { body } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const registerValidator = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name required'),
  body('lastName').notEmpty().withMessage('Last name required'),
];

module.exports = { loginValidator, registerValidator };
```
**Create:** `middleware/validators/ticketValidators.js`
```js
const { body, param } = require('express-validator');

const createTicketValidator = [
  body('phoneNumber').notEmpty().withMessage('Phone number required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['new', 'open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
];

const updateTicketValidator = [
  param('id').notEmpty().withMessage('Ticket ID required'),
];

module.exports = { createTicketValidator, updateTicketValidator };
```
**Usage in routes:**
```js
const { loginValidator } = require('../middleware/validators/authValidators');
const { validate } = require('../middleware/validate');

router.post('/login', loginValidator, validate, async (req, res) => { ... });
```

---

### Task 2.7: Standardize API Response Format
**Create:** `utils/apiResponse.js`
```js
const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const notImplemented = (res, feature = 'This feature') => {
  return res.status(501).json({
    success: false,
    message: `${feature} is not implemented yet`,
  });
};

module.exports = { success, error, notImplemented };
```

---

### Phase 2 Checklist
```
[ ] 2.1 - Created shared supabaseAuth middleware, replaced inline auth in 5 files
[ ] 2.2 - Removed 4 dead legacy route imports from app.js
[ ] 2.3 - Created route handler skeletons for all 30+ missing endpoints
[ ] 2.4 - /api/auth/me returns JWT user data (temporary, no DB needed)
[ ] 2.5 - Updated .env.example with all current env vars
[ ] 2.6 - Added input validation middleware + validators
[ ] 2.7 - Created standardized API response helpers
[ ] Tested: All previously-404 endpoints now return 501
[ ] Tested: /api/auth/me returns user data from token
[ ] Tested: Backend starts clean without Supabase connection
[ ] Committed as: "Phase 2: Backend cleanup and route skeletons"
```

---

## Phase 3: HIGH-IMPACT UI FEATURES (No Database Needed)

**Priority:** HIGH
**Estimated Time:** 5-7 hours
**Why:** These are user-facing features that make the product feel complete.

---

### Task 3.1: Add WhatsApp Button (Web Dashboard)
**Files to modify:**
- `webdashboard/src/pages/crm/TicketList.jsx` (or wherever ticket rows are rendered)
- `webdashboard/src/pages/calls/CallLogs.jsx`

**Add to each ticket/call row or detail view:**
```jsx
<button
  onClick={() => window.open(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`, '_blank')}
  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
  title="Message on WhatsApp"
>
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.614-1.48A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.09 0-4.034-.657-5.632-1.776l-.404-.262-2.732.878.728-2.664-.288-.421A9.71 9.71 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/>
  </svg>
  WhatsApp
</button>
```
**No backend needed.** This just opens wa.me with the phone number.

---

### Task 3.2: Add WhatsApp Intent (Android)
**Files to modify:**
- `app/.../activities/TicketDetailsActivity.java`
- `app/.../fragments/CallLogsFragment.java` (in call log item click/long-press)

**Add method:**
```java
private void openWhatsApp(String phoneNumber) {
    if (phoneNumber == null || phoneNumber.isEmpty()) {
        Toast.makeText(this, "No phone number available", Toast.LENGTH_SHORT).show();
        return;
    }
    // Clean phone number - remove spaces, dashes, etc.
    String cleanNumber = phoneNumber.replaceAll("[^0-9+]", "");
    // Add India country code if not present
    if (!cleanNumber.startsWith("+")) {
        cleanNumber = "+91" + cleanNumber;
    }
    try {
        Intent intent = new Intent(Intent.ACTION_VIEW,
            Uri.parse("https://wa.me/" + cleanNumber.replace("+", "")));
        startActivity(intent);
    } catch (Exception e) {
        Toast.makeText(this, "WhatsApp not installed", Toast.LENGTH_SHORT).show();
    }
}
```
**Add a WhatsApp button** in ticket detail view and call log items.

---

### Task 3.3: Build Kanban Board Page (Web Dashboard)
**File:** `webdashboard/src/pages/crm/KanbanBoard.jsx` (replace the "Coming Soon" placeholder)

**Requirements:**
- 5 columns: New → Open → In Progress → Resolved → Closed
- Use `@dnd-kit/core` and `@dnd-kit/sortable` (already installed in package.json)
- Load tickets from the existing `/api/tickets` endpoint
- Drag-and-drop to move tickets between columns
- Each card shows: customer name/phone, priority badge, age (hours/days since created)
- On drop to new column, call `PUT /api/tickets/:id` with new status
- If API fails (501 or network error), show toast and revert the card position
- Mobile: columns should be tabs (one column visible at a time), not horizontal scroll

---

### Task 3.4: Build CRM Analytics Page (Web Dashboard)
**File:** `webdashboard/src/pages/crm/CRMAnalytics.jsx` (replace the "Coming Soon" placeholder)

**Requirements:**
- Use `recharts` (already installed)
- Charts to build (use data from existing endpoints where possible):
  1. **Ticket Pipeline Bar Chart** — count of tickets per status (from `/api/tickets`)
  2. **Priority Distribution Pie Chart** — low/medium/high/urgent breakdown
  3. **Call Volume Line Chart** — calls per day over last 30 days (from `/api/call-logs`)
  4. **Conversion Funnel** — New → Open → In Progress → Resolved → Closed percentages
- If API returns error, show charts with "No data available" state
- Each chart in a card with title and description
- Responsive: 2 columns on desktop, 1 column on mobile

---

### Task 3.5: Client-Side CSV Export
**Files to modify:**
- `webdashboard/src/pages/calls/CallLogs.jsx` — add export button
- `webdashboard/src/pages/crm/TicketList.jsx` — add export button

**No backend needed.** Generate CSV from the data already loaded in the browser:
```js
const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

### Task 3.6: Fix Dashboard Stat Percentages
**File:** `webdashboard/src/pages/dashboard/Dashboard.jsx`
**Current:** Hardcoded `+12%`, `-5%`, `+8%`, `+15%`
**Action:** Calculate real percentages by comparing current period vs previous period from the fetched data. If comparison data is not available, show `--` instead of fake numbers.

---

### Task 3.7: Fix Headless UI v2 in Header.jsx
**File:** `webdashboard/src/components/dashboard/Header.jsx`
**Change these imports:**
```jsx
// BEFORE (v1)
import { Menu, Transition } from '@headlessui/react';
// AFTER (v2)
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
```
**Replace in JSX:**
- `Menu.Button` → `MenuButton`
- `Menu.Items` → `MenuItems`
- `Menu.Item` → `MenuItem`
- Same pattern as already done in Sidebar.jsx and Modal.jsx

---

### Task 3.8: Add Error Boundary Components
**Create:** `webdashboard/src/components/common/ErrorBoundary.jsx`
```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-4">This section encountered an error.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```
**Wrap each major page** in the dashboard layout with `<ErrorBoundary>`.

---

### Phase 3 Checklist
```
[ ] 3.1 - WhatsApp button on web ticket/call pages
[ ] 3.2 - WhatsApp intent on Android ticket detail + call logs
[ ] 3.3 - Kanban Board page (drag-drop, 5 columns, real ticket data)
[ ] 3.4 - CRM Analytics page (4 charts with recharts)
[ ] 3.5 - Client-side CSV export for tickets and call logs
[ ] 3.6 - Real dashboard stat percentages (or "--" if no comparison data)
[ ] 3.7 - Fixed Headless UI v2 in Header.jsx
[ ] 3.8 - Error boundary components wrapping major pages
[ ] Tested: Kanban loads tickets and drag-drop works
[ ] Tested: Analytics charts render (even with empty data)
[ ] Tested: CSV export downloads a valid file
[ ] Tested: WhatsApp opens correctly on both web and Android
[ ] Committed as: "Phase 3: High-impact UI features"
```

---

## Phase 4: ANDROID UX IMPROVEMENTS (No Database Needed)

**Priority:** MEDIUM
**Estimated Time:** 4-5 hours
**Why:** Retail agents need 3-4 tap workflows. This is the product differentiator.

---

### Task 4.1: Simplify TicketPopupActivity to 3-4 Taps
**File:** `app/.../activities/TicketPopupActivity.java`

**Current flow:** Too many fields, text input required.
**Target flow (3-4 taps, under 10 seconds):**

**Screen layout:**
```
┌─────────────────────────────┐
│  📞 +91 9876543210          │
│  Incoming Call • 2:34 min    │
│                              │
│  INTEREST LEVEL (tap one):   │
│  [🔥 Hot] [🟡 Warm] [❄️ Cold]│
│                              │
│  OUTCOME (tap one):          │
│  [✅ Interested]             │
│  [📞 Callback]               │
│  [❌ Not Interested]         │
│  [🛒 Purchased]              │
│                              │
│  QUICK NOTE (tap one):       │
│  [Wants pricing]             │
│  [Will visit store]          │
│  [Needs demo]                │
│  [Follow up tomorrow]        │
│  [Already has one]           │
│  [Wrong number]              │
│                              │
│  [💬 WhatsApp]  [💾 SAVE]   │
└─────────────────────────────┘
```

**Implementation:**
- Interest level: 3 `MaterialButton` chips (Hot/Warm/Cold) — single select
- Outcome: 4 `MaterialButton` chips — single select
- Quick notes: 6 `Chip` buttons — multi-select (can pick multiple)
- WhatsApp button: opens wa.me with the phone number
- Save button: creates ticket with selected values, closes popup
- NO text fields, NO keyboard, NO dropdowns
- Total: 3 taps (interest + outcome + save) or 4 taps (interest + outcome + note + save)

---

### Task 4.2: Add Pre-defined Quick Notes as Chips
**File:** `app/.../activities/TicketDetailsActivity.java`

**In the notes section**, add a row of chip buttons above the text input:
```java
String[] quickNotes = {
    "Wants pricing",
    "Will visit store",
    "Needs demo",
    "Follow up tomorrow",
    "Callback requested",
    "Already has one",
    "Shared catalog on WhatsApp",
    "Wrong number",
    "Budget issue",
    "Competitor comparison"
};
```
Tapping a chip should auto-fill the note text. Agent can still type custom notes if needed, but 80% of the time they'll just tap a chip.

---

### Task 4.3: Improve Ticket List Cards (Android)
**File:** `app/.../adapters/EnhancedTicketAdapter.java`
**File:** `app/app/src/main/res/layout/item_ticket_enhanced.xml`

**Each ticket card should show at a glance:**
- Customer phone number (large, tappable to call)
- Interest level badge (Hot=red, Warm=yellow, Cold=blue)
- Last outcome
- Time since last contact (e.g., "2h ago", "Yesterday", "3 days ago")
- WhatsApp icon button
- Call icon button

**Remove from card:** Ticket ID, organization name, created date (agents don't care about these)

---

### Task 4.4: Enable ProGuard for Release Builds
**File:** `app/app/build.gradle.kts` — Line 22
**Change:**
```kotlin
// BEFORE
isMinifyEnabled = false

// AFTER
isMinifyEnabled = true
isShrinkResources = true
```
**Also:** Verify the ProGuard rules files referenced in lines 23-26 have proper keep rules for:
- Retrofit models (all classes in `models/` package)
- Gson `@SerializedName` annotations
- OkHttp
- Any reflection-based code

**Test:** Build a release APK and verify the app works correctly.

---

### Phase 4 Checklist
```
[ ] 4.1 - Simplified TicketPopupActivity (3-4 taps max)
[ ] 4.2 - Pre-defined quick notes as chip buttons
[ ] 4.3 - Improved ticket list cards (phone, interest, age, WhatsApp)
[ ] 4.4 - ProGuard enabled for release builds
[ ] Tested: Ticket creation in under 10 seconds
[ ] Tested: Quick notes work on ticket detail
[ ] Tested: Release APK builds and runs correctly with ProGuard
[ ] Committed as: "Phase 4: Android UX improvements for retail"
```

---

## Phase 5: BACKEND LOGIC (Pure Functions — No Database Needed)

**Priority:** MEDIUM
**Estimated Time:** 2-3 hours
**Why:** These are pure business logic functions that can be tested independently and wired to the database later.

---

### Task 5.1: SLA Calculation Logic
**Create:** `backend/utils/slaCalculator.js`
```js
const SLA_HOURS = {
  urgent: 1,
  high: 4,
  medium: 8,
  low: 24,
};

const calculateSLA = (createdAt, priority) => {
  const slaHours = SLA_HOURS[priority] || SLA_HOURS.medium;
  const deadline = new Date(new Date(createdAt).getTime() + slaHours * 60 * 60 * 1000);
  const now = new Date();
  const remaining = deadline - now;

  return {
    deadline: deadline.toISOString(),
    slaHours,
    isBreached: remaining < 0,
    remainingMinutes: Math.floor(remaining / 60000),
    status: remaining < 0 ? 'breached' : remaining < slaHours * 30 * 60000 ? 'at_risk' : 'on_track',
  };
};

module.exports = { calculateSLA, SLA_HOURS };
```

---

### Task 5.2: Round-Robin Assignment Algorithm
**Create:** `backend/utils/assignmentEngine.js`
```js
// In-memory last-assigned tracker (will be replaced with DB when ready)
const lastAssigned = {};

const roundRobinAssign = (teamMembers, teamId) => {
  if (!teamMembers || teamMembers.length === 0) return null;

  const lastIndex = lastAssigned[teamId] || -1;
  const nextIndex = (lastIndex + 1) % teamMembers.length;
  lastAssigned[teamId] = nextIndex;

  return teamMembers[nextIndex];
};

// Weighted assignment based on current load
const leastLoadAssign = (teamMembers, ticketCounts) => {
  if (!teamMembers || teamMembers.length === 0) return null;

  let minLoad = Infinity;
  let assignee = teamMembers[0];

  for (const member of teamMembers) {
    const load = ticketCounts[member.id] || 0;
    if (load < minLoad) {
      minLoad = load;
      assignee = member;
    }
  }

  return assignee;
};

module.exports = { roundRobinAssign, leastLoadAssign };
```

---

### Task 5.3: Replace Mock Notifications with Proper Structure
**File:** `routes/supabaseNotifications.js`
**Current:** Returns hardcoded arrays.
**Action:** Return an empty array with proper structure instead of fake data:
```js
router.get('/', supabaseAuth, (req, res) => {
  // Will be replaced with DB query when Supabase is ready
  res.json({
    success: true,
    data: [],
    message: 'Notifications will be available once the system is fully connected',
  });
});
```
This is better than fake data because the frontend will show "No notifications" (correct) instead of fake notifications (confusing).

---

### Phase 5 Checklist
```
[ ] 5.1 - SLA calculator with priority-based deadlines
[ ] 5.2 - Round-robin + least-load assignment algorithms
[ ] 5.3 - Replaced mock notifications with empty array structure
[ ] Tested: SLA calculator returns correct deadlines for all priorities
[ ] Tested: Assignment algorithms work with sample data
[ ] Committed as: "Phase 5: Business logic utilities"
```

---

## Summary: Total Work Without Database

| Phase | Tasks | Est. Time | Priority |
|-------|-------|-----------|----------|
| Phase 1: Security Fixes | 8 tasks | 2-3 hours | CRITICAL — do first |
| Phase 2: Backend Cleanup | 7 tasks | 3-4 hours | HIGH |
| Phase 3: UI Features | 8 tasks | 5-7 hours | HIGH |
| Phase 4: Android UX | 4 tasks | 4-5 hours | MEDIUM |
| Phase 5: Backend Logic | 3 tasks | 2-3 hours | MEDIUM |
| **TOTAL** | **30 tasks** | **16-22 hours** | |

---

## What Arsalan is Doing in Parallel

- Setting up new Supabase instance
- Creating all database tables (users, organizations, tickets, call_logs, ticket_notes, ticket_history, notifications, teams, team_members, contacts)
- Setting up Row Level Security (RLS) policies
- Writing SQL migration script so the schema is version-controlled
- Once DB is ready, the route skeletons from Phase 2 will be wired to real queries

---

## Communication

- Commit each phase separately with the suggested commit messages
- Push to `main` after each phase
- If blocked on anything, message Arsalan before moving to the next phase
- Do NOT deploy to Vercel/Netlify until Phase 1 is complete and verified

---

*Generated 2026-02-20 — CALLpro Dev Task Report*
