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

app.set('trust proxy', 1);

const corsOptions = {
  origin: config.clientOrigin,
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

const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.use('/api/auth', authLimiter);
app.use(apiLimiter);
app.use(csurf({ cookie: { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'strict' } }));

app.use((req, res, next) => {
  if (typeof req.csrfToken === 'function') {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
      httpOnly: false,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict'
    });
  }
  next();
});

app.get('/api/csrf-token', (req, res) => {
  res.json({ success: true, csrfToken: req.csrfToken() });
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use(errorHandler);

module.exports = app;
