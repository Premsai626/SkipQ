import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import { DocumentController } from './controllers/documentController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../../dist');

export const app = express();

// 1. Security Headers via Helmet (with cross-origin resource policy allowing images)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Allows React SPA Vite in dev/prod
  })
);

// 2. Strict CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        config.allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin '${origin}' not permitted by CORS policy`));
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. Rate Limiting on Sensitive Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 auth requests per 15 min
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP to 60 document uploads per 15 min
  message: {
    success: false,
    message: 'Too many upload attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(['/api/v1/auth', '/api/auth'], authLimiter);
app.use(['/api/v1/documents/upload', '/api/documents/upload'], uploadLimiter);

// 4. Body Parsers with safe size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Root Health Check (Public, for AWS ECS / Load Balancer)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'xerox-flow-api',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 6. Secure Document Route (/uploads/:filename requires authentication and ownership)
app.get('/uploads/:filename', authenticate, DocumentController.getFile);

// 7. API Routes
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter); // Alias for compatibility

// 8. Serve static frontend assets in production if built dist exists
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// 9. Centralized Error Handling
app.use(errorHandler);
