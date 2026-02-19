# Backend CORS Configuration Fix

The "Unable to connect to backend server" error is likely caused by CORS (Cross-Origin Resource Sharing) issues.

## Add this to your backend (app.js or index.js):

```javascript
const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://calltracker-pro-dashboard.netlify.app',
    'https://calltracker-pro-dashboards.netlify.app',
    'https://*.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
```

## Or if you want to allow all origins during development:

```javascript
const cors = require('cors');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: false
}));
```

## Make sure you have the cors package installed:

```bash
npm install cors
```

## Then redeploy your backend to Vercel.

The CORS middleware should be added BEFORE your route definitions.