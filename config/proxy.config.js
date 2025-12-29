/**
 * Proxy Configuration for BloomLead Development Server
 * Handles routing for API calls, authentication, and other backend services
 */

// Backend server configuration
const BACKEND_CONFIG = {
  // Main API server
  api: {
    target: process.env.API_URL || 'http://localhost:8000',
    changeOrigin: true,
    secure: false
  },
  
  // Authentication server (if separate)
  auth: {
    target: process.env.AUTH_URL || 'http://localhost:8001',
    changeOrigin: true,
    secure: false
  },
  
  // Media/Upload server (if separate)
  media: {
    target: process.env.MEDIA_URL || 'http://localhost:8002',
    changeOrigin: true,
    secure: false
  }
};

// Proxy route configurations
const PROXY_ROUTES = [
  {
    // API routes - main backend
    context: ['/api/**'],
    ...BACKEND_CONFIG.api,
    pathRewrite: {
      // Example: rewrite /api/v1 to /api
      // '^/api/v1': '/api'
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add custom headers if needed
      proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
      proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
      
      console.log(`[API PROXY] ${req.method} ${req.url} -> ${proxyReq.getHeader('host')}${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log response
      console.log(`[API PROXY] ${proxyRes.statusCode} ${req.url}`);
      
      // Add CORS headers to response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    },
    onError: (err, req, res) => {
      console.error(`[API PROXY ERROR] ${req.url}:`, err.message);
      
      // Send error response
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Proxy Error',
          message: err.message,
          url: req.url,
          timestamp: new Date().toISOString()
        });
      }
    }
  },
  
  {
    // Authentication routes
    context: ['/auth/**', '/login/**', '/logout/**', '/register/**'],
    ...BACKEND_CONFIG.auth,
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[AUTH PROXY] ${req.method} ${req.url}`);
    }
  },
  
  {
    // Media and upload routes
    context: ['/uploads/**', '/media/**', '/files/**'],
    ...BACKEND_CONFIG.media,
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[MEDIA PROXY] ${req.method} ${req.url}`);
    }
  },
  
  {
    // Admin and dashboard routes
    context: ['/admin/**', '/dashboard/**'],
    ...BACKEND_CONFIG.api,
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[ADMIN PROXY] ${req.method} ${req.url}`);
    }
  },
  
  {
    // WebSocket proxy (if needed)
    context: ['/ws/**', '/socket.io/**'],
    ...BACKEND_CONFIG.api,
    ws: true, // Enable WebSocket proxying
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[WS PROXY] ${req.method} ${req.url}`);
    }
  },
  
  {
    // Health check and status routes
    context: ['/health/**', '/status/**', '/ping'],
    ...BACKEND_CONFIG.api,
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[HEALTH PROXY] ${req.method} ${req.url}`);
    }
  }
];

// Custom middleware for handling special cases
const customMiddleware = (app) => {
  // Log all requests
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.get('User-Agent')}`);
    next();
  });
  
  // Handle CORS preflight requests
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, X-CSRF-Token');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });
  
  // Mock API endpoints for development (if backend not available)
  if (process.env.MOCK_API === 'true') {
    // Mock config endpoint
    app.get('/api/config', (req, res) => {
      res.json({
        googleAnalyticsId: 'YOUR_GOOGLE_ANALYTICS_ID',
        facebookPixelId: 'YOUR_FACEBOOK_PIXEL_ID',
        environment: 'development',
        debugMode: true
      });
    });
    
    // Mock analytics endpoint
    app.post('/api/marketing-analytics', (req, res) => {
      console.log('[MOCK API] Analytics event:', req.body);
      res.json({ success: true, message: 'Event tracked' });
    });
    
    // Mock auth endpoints
    app.post('/api/auth/login', (req, res) => {
      res.json({ 
        success: true, 
        token: 'mock-jwt-token',
        user: { id: 1, email: 'test@example.com' }
      });
    });
    
    console.log('🔧 Mock API endpoints enabled');
  }
  
  // Handle 404s for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: 'API endpoint not found',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });
};

// Export configuration
module.exports = {
  BACKEND_CONFIG,
  PROXY_ROUTES,
  customMiddleware,
  
  // Helper function to get proxy config for webpack
  getWebpackProxyConfig: () => PROXY_ROUTES,
  
  // Helper function to setup custom middleware
  setupMiddleware: (middlewares, devServer) => {
    customMiddleware(devServer.app);
    return middlewares;
  }
};