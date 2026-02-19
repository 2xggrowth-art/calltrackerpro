# CallTracker Pro Dashboards

A comprehensive React application for CallTracker Pro that includes both a professional landing page and a Super Admin dashboard for platform management.

## 🚀 Features

### Landing Page
- **Modern Design**: Responsive design with smooth animations and gradient effects
- **Complete Sections**: 
  - Hero section with compelling CTAs
  - Features showcase with icons and descriptions
  - About section with company information and team
  - Pricing tiers (Free, Pro ₹499, Business ₹899, Enterprise ₹1499)
  - Contact form with backend integration
  - Professional footer with links and social media

### Super Admin Dashboard
- **Secure Authentication**: Protected routes with role-based access control
- **Platform Overview**: Real-time metrics and system health indicators
- **Organization Management**: Comprehensive organization administration
- **User Management**: Global user search and management across organizations
- **Analytics & Reporting**: Platform-wide analytics and insights
- **System Settings**: Configuration and maintenance tools

## 🛠 Technology Stack

- **Frontend**: React 18 with modern hooks and context
- **Routing**: React Router v6 with nested routes
- **Styling**: Tailwind CSS v3 with custom design system
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Heroicons for consistent iconography
- **Forms**: React Hook Form with validation
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **State Management**: React Context API

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components (Button, Input, Card, Modal)
│   ├── landing/          # Landing page components
│   └── dashboard/        # Admin dashboard components
├── pages/
│   ├── Landing/          # Landing page
│   └── Admin/           # Admin dashboard pages
├── services/            # API integration and auth services
├── contexts/            # React contexts (AuthContext)
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
└── styles/             # Global styles and Tailwind config
```

## 🔧 Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Update the environment variables in .env:
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_ENVIRONMENT=development
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🌐 Routes

### Public Routes
- `/` - Landing page with all sections
- `/admin/login` - Admin authentication
- `/unauthorized` - Access denied page
- `/*` - 404 not found page

### Protected Admin Routes (Super Admin only)
- `/admin/dashboard` - Platform overview
- `/admin/organizations` - Organization management
- `/admin/users` - User management
- `/admin/analytics` - Analytics and reporting
- `/admin/settings` - System configuration

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#667eea to #764ba2)
- **Secondary**: Cyan to green gradient (#00c9ff to #92fe9d)
- **Accent**: Orange gradient (#ff6b6b to #ffa726)
- **Neutrals**: Professional grays and whites

### Components
- Consistent button variants (primary, secondary, accent, outline)
- Form inputs with validation states
- Cards with hover effects
- Modals with smooth transitions
- Loading spinners and skeletons

## 🔐 Authentication Flow

1. **Login Process**:
   - Navigate to `/admin/login`
   - Enter super admin credentials
   - JWT token stored in localStorage
   - Redirect to dashboard on success

2. **Protected Routes**:
   - Authentication check via AuthContext
   - Role verification for super admin access
   - Automatic redirect to login if unauthorized

## 🔌 API Integration

### Expected Backend Endpoints
```javascript
// Authentication
POST /api/auth/login - User authentication
GET /api/auth/me - Current user data
POST /api/auth/logout - User logout

// Admin endpoints
GET /api/admin/organizations - Organization list
GET /api/admin/users - User management
GET /api/admin/analytics - Platform analytics
```

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: Following Tailwind's responsive system
- **Navigation**: Collapsible mobile menu
- **Dashboard**: Responsive sidebar and content areas

## 🧪 Development Notes

### Mock Data
The application currently uses mock data for demonstration. Replace with real API calls:
- Dashboard statistics in `Overview.jsx`
- User and organization data
- Analytics and reporting data

### Future Enhancements
- Real-time data updates with WebSockets
- Advanced data visualization with Recharts
- Export functionality for reports
- Advanced search and filtering

## 🚀 Deployment

### Build the Application
```bash
npm run build
```

### Deploy to Static Hosting
The built files in the `build/` directory can be deployed to any static hosting service:
- Netlify, Vercel, AWS S3 + CloudFront, GitHub Pages

### Environment Variables for Production
```bash
REACT_APP_API_URL=https://api.calltrackerprp.com/api
REACT_APP_ENVIRONMENT=production
```

---

**Built with ❤️ for CallTracker Pro**
