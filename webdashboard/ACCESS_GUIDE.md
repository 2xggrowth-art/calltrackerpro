# CallTracker Pro Dashboard Access Guide

## 🔐 How to Access the Dashboard

### **Option 1: Through Landing Page (Recommended)**
1. Visit your deployed site: `https://calltracker-pro-dashboard.netlify.app/`
2. Click the **"Sign In"** button in the top navigation
3. You'll be redirected to `/login`
4. Enter your credentials and access the role-based dashboard

### **Option 2: Direct Login Access**
- **Development**: `http://localhost:3000/login`
- **Production**: `https://calltracker-pro-dashboard.netlify.app/login`

### **Option 3: Legacy Admin Route (Still Supported)**
- **Development**: `http://localhost:3000/admin/login` → redirects to `/login`
- **Production**: `https://calltracker-pro-dashboard.netlify.app/admin/login` → redirects to `/login`

## 🎯 Role-Based Dashboard Access

After successful login, users are automatically redirected to role-appropriate dashboards:

### **Super Admin** (`super_admin`)
- **Default Route**: `/dashboard/admin`
- **Access**: Full platform access including:
  - Organization management
  - Cross-organization user management  
  - System-wide analytics
  - All CRM features
  - Platform settings

### **Organization Admin** (`org_admin`)
- **Default Route**: `/dashboard/crm/tickets`
- **Access**: Organization-level access including:
  - Organization user management
  - Organization-wide ticket management
  - Team analytics
  - All CRM features within organization

### **Manager** (`manager`)
- **Default Route**: `/dashboard/crm/tickets`
- **Access**: Team-level access including:
  - Team ticket management
  - Team analytics
  - Ticket assignment and oversight
  - Call logs

### **Agent** (`agent`)
- **Default Route**: `/dashboard/crm/calls`
- **Access**: Individual access including:
  - Personal ticket management
  - Ticket creation
  - Call logs
  - Personal dashboard

### **Viewer** (`viewer`)
- **Default Route**: `/dashboard/crm/calls`
- **Access**: Read-only access including:
  - View assigned tickets
  - View call logs
  - Basic dashboard

## 🚀 Navigation Structure

### **Main Dashboard Routes**
- `/dashboard` - Role-specific dashboard home
- `/dashboard/crm/tickets` - Ticket management
- `/dashboard/crm/tickets/new` - Create new ticket
- `/dashboard/crm/tickets/:id` - View/edit ticket details
- `/dashboard/crm/kanban` - Kanban board (coming soon)
- `/dashboard/crm/calls` - Call logs
- `/dashboard/crm/analytics` - CRM analytics (manager+ only)

### **Admin Routes** (Super Admin & Org Admin only)
- `/dashboard/admin/overview` - Admin overview
- `/dashboard/admin/organizations` - Organization management (super admin only)
- `/dashboard/admin/users` - User management
- `/dashboard/admin/analytics` - System analytics
- `/dashboard/admin/settings` - System settings

### **Personal Routes** (All authenticated users)
- `/dashboard/profile` - User profile (coming soon)
- `/dashboard/notifications` - Notifications (coming soon)

## 🔒 Authentication Flow

1. **Unauthenticated Users**:
   - See landing page at `/`
   - All dashboard routes redirect to `/`
   - Login accessible via "Sign In" button

2. **Authenticated Users**:
   - Landing page (`/`) redirects to role-based dashboard
   - Full access to role-appropriate features
   - Automatic role-based navigation and permissions

## 🛠️ Development Access

For development and testing:

```bash
# Start development server
npm start

# Access points:
# - Landing: http://localhost:3000/
# - Login: http://localhost:3000/login
# - Dashboard: http://localhost:3000/dashboard (requires auth)
```

## 📱 Mobile Access

The dashboard is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)

All CRM features work seamlessly across devices with touch-optimized interfaces.

## 🔧 Backend Integration

The frontend integrates with your backend APIs:
- **Tickets API**: `/api/tickets/*`
- **Call Logs API**: `/api/call-logs/*`
- **Notifications API**: `/api/notifications/*`
- **Users API**: `/api/users/*`
- **Organizations API**: `/api/organizations/*`

## 🎯 Quick Start for Different Roles

### **For Agents**: 
1. Login → Auto-redirected to call logs
2. Create tickets from calls
3. Manage assigned tickets

### **For Managers**:
1. Login → Auto-redirected to ticket list
2. Oversee team tickets
3. View team analytics
4. Assign tickets to agents

### **For Org Admins**:
1. Login → Access all organization features
2. Manage organization users
3. View organization-wide analytics
4. Full CRM access

### **For Super Admins**:
1. Login → Access admin overview
2. Manage multiple organizations
3. System-wide user management
4. Platform analytics and settings

This structure ensures that each user sees exactly what they need based on their role and permissions!