const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const config = require('./config');

const app = express();

// Hide technology stack
app.disable('x-powered-by');

app.set('trust proxy', 1);

const corsOptions = {
  origin: config.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  optionsSuccessStatus: 204
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      blockAllMixedContent: [],
      fontSrc: ["'self'", 'https:', 'data:'],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const shouldDebugCsrf = process.env.DEBUG_CSRF === 'true';
console.log('[CSRF STARTUP] DEBUG_CSRF=' + process.env.DEBUG_CSRF + ' enabled=' + shouldDebugCsrf);

const logCsrfDebug = (req, label) => {
  if (!shouldDebugCsrf) return;
  if (!['/api/csrf-token', '/api/auth/login', '/api/auth/login/verify'].includes(req.path)) return;
  console.log('[CSRF DEBUG]', label, {
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path,
    method: req.method,
    userAgent: req.headers['user-agent'],
    origin: req.headers.origin,
    referer: req.headers.referer,
    hasXcsrfHeader: !!req.headers['x-csrf-token'],
    hasXxsrfHeader: !!req.headers['x-xsrf-token'],
    hasXsrfCookie: !!(req.cookies && req.cookies['XSRF-TOKEN']),
    hasCsrfCookie: !!(req.cookies && req.cookies._csrf),
    rawCookieHeader: req.headers.cookie ? '<present>' : '<missing>'
  });
};

app.use((req, res, next) => {
  logCsrfDebug(req, 'incoming request');
  next();
});

app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp());
app.use(morgan('combined'));

const authLimiter = rateLimit({
  windowMs: config.authRateLimitWindowMs,
  max: config.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication requests, please try again later.' }
});

// A lighter limiter for non-sensitive auth endpoints (optional).
const authMeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // allow more requests for /auth/me
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Exclude the public "me" endpoint from the strict auth limiter to avoid
// accidental 429s from frequent client-side profile checks. We still apply
// a lighter limiter for GET /api/auth/me to protect from abuse.
app.use('/api/auth', (req, res, next) => {
  if (req.path === '/me' && req.method === 'GET') {
    return authMeLimiter(req, res, next);
  }
  return authLimiter(req, res, next);
});
app.use(apiLimiter);

const authCsrfExceptionPaths = new Set(['/api/auth/login', '/api/auth/login/verify']);
const csrfProtection = csurf({ cookie: { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'none' } });

const isAllowedOriginOrReferer = (req) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  return (
    (typeof origin === 'string' && config.allowedOrigins.includes(origin)) ||
    (typeof referer === 'string' && config.allowedOrigins.some((allowedOrigin) => referer.startsWith(allowedOrigin)))
  );
};

const authCsrfFallback = (req) => {
  const tokenHeader = req.headers['x-csrf-token'];
  const tokenCookie = req.cookies ? req.cookies['XSRF-TOKEN'] : undefined;
  const allowedSource = isAllowedOriginOrReferer(req);

  if (!allowedSource || !tokenHeader) {
    return false;
  }

  if (tokenCookie && tokenHeader !== tokenCookie) {
    return false;
  }

  return true;
};

app.use((req, res, next) => {
  logCsrfDebug(req, 'before CSRF');
  next();
});
app.use(csrfProtection);
app.use((err, req, res, next) => {
  logCsrfDebug(req, 'csurf error');
  if (err && err.code === 'EBADCSRFTOKEN' && req.method === 'POST' && authCsrfExceptionPaths.has(req.path)) {
    if (authCsrfFallback(req)) {
      console.log('[CSRF DEBUG] fallback accepted for', req.path, {
        header: req.headers['x-csrf-token'] || null,
        cookie: req.cookies ? req.cookies['XSRF-TOKEN'] : null,
        origin: req.headers.origin || null,
        referer: req.headers.referer || null
      });
      return next();
    }
    console.log('[CSRF DEBUG] fallback rejected for', req.path, {
      header: req.headers['x-csrf-token'] || null,
      cookie: req.cookies ? req.cookies['XSRF-TOKEN'] : null,
      origin: req.headers.origin || null,
      referer: req.headers.referer || null
    });
  }
  next(err);
});

app.use((req, res, next) => {
  if (typeof req.csrfToken === 'function') {
    const token = req.csrfToken();
    if (shouldDebugCsrf && ['/api/csrf-token', '/api/auth/login'].includes(req.path)) {
      console.log('[CSRF DEBUG] setting response csrf cookie', {
        path: req.path,
        token
      });
    }
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      secure: config.nodeEnv === 'production',
      sameSite: 'none'
    });
  }
  next();
});

const sanitizeAuthResponse = (body) => {
  if (body === null || body === undefined) return body;
  if (typeof body !== 'object') return body;

  const sanitized = {};
  if (typeof body.success === 'boolean') sanitized.success = body.success;
  if (typeof body.message === 'string') sanitized.message = body.message;

  if (body.data && typeof body.data === 'object') {
    sanitized.data = {
      keys: Object.keys(body.data),
      requiresOtp: typeof body.data.requiresOtp === 'boolean' ? body.data.requiresOtp : undefined,
      hasToken: 'accessToken' in body.data || 'refreshToken' in body.data || 'token' in body.data,
      hasUser: 'user' in body.data
    };
  }

  if (Array.isArray(body.errors)) {
    sanitized.errors = body.errors.map((error) => ({ message: typeof error.message === 'string' ? error.message : '<unknown>' }));
  }

  return sanitized;
};

app.use((req, res, next) => {
  if (!shouldDebugCsrf || req.method !== 'POST' || req.path !== '/api/auth/login') {
    return next();
  }

  const hasXcsrfHeader = !!req.headers['x-csrf-token'];
  const hasXxsrfHeader = !!req.headers['x-xsrf-token'];
  const hasXsrfCookie = !!(req.cookies && req.cookies['XSRF-TOKEN']);
  const hasCsrfCookie = !!(req.cookies && req.cookies._csrf);

  let sanitizedResponseBody;
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = (body) => {
    sanitizedResponseBody = sanitizeAuthResponse(body);
    return originalJson(body);
  };

  res.send = (body) => {
    sanitizedResponseBody = sanitizeAuthResponse(body);
    return originalSend(body);
  };

  res.on('finish', () => {
    console.log('[CSRF DEBUG] login inspector', {
      path: req.path,
      statusCode: res.statusCode,
      hasXcsrfHeader,
      hasXxsrfHeader,
      hasXsrfCookie,
      hasCsrfCookie,
      responseBody: sanitizedResponseBody
    });
  });

  next();
});

app.get('/api/csrf-token', (req, res) => {
  if (shouldDebugCsrf) {
    console.log('[CSRF DEBUG] GET /api/csrf-token response token', {
      token: req.csrfToken()
    });
  }
  res.json({ success: true, csrfToken: req.csrfToken() });
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api', routes);

const Product = require('./models/Product');
const SITE_URL = process.env.SITE_URL || 'https://konpuk.com';

// Redirect old product ID URLs to new slug-based URLs (302)
app.get('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('Not found');
    const product = await Product.findById(id).select('slug');
    if (!product || !product.slug) return res.status(404).send('Not found');
    return res.redirect(302, `${SITE_URL.replace(/\/$/, '')}/products/${product.slug}`);
  } catch (err) {
    console.warn('Redirect error', err && err.message);
    return res.status(500).send('Server error');
  }
});

// Sitemap and robots
try {
  const sitemapRoutes = require('./routes/sitemap.routes');
  app.use('/', sitemapRoutes);
} catch (err) {
  console.warn('Sitemap routes not mounted:', err && err.message);
}

app.get('/robots.txt', (req, res) => {
  const siteUrl = process.env.SITE_URL || 'https://konpuk.com';
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /dashboard',
    `Sitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml`
  ];
  res.type('text/plain').send(lines.join('\n'));
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use(errorHandler);

module.exports = app;
