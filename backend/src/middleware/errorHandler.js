import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  // Log full error internally for debugging
  console.error('[API Error]:', err.message || err);

  // 1. Zod Validation Error (HTTP 400)
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Multer Upload Error (HTTP 400)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
      timestamp: new Date().toISOString(),
    });
  }

  // 3. JWT Authentication Errors (HTTP 401)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
  }

  // 4. Custom status code or inferred status code
  let statusCode = err.statusCode || 500;
  if (!err.statusCode) {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('not found')) statusCode = 404;
    else if (msg.includes('forbidden') || msg.includes('access denied')) statusCode = 403;
    else if (msg.includes('unauthorized')) statusCode = 401;
    else if (msg.includes('invalid') || msg.includes('cannot') || msg.includes('only') || msg.includes('required')) statusCode = 400;
  }

  // Sanitize message: never expose stack traces, database credentials, or internal file paths
  const safeMessage = statusCode === 500
    ? 'An unexpected internal server error occurred'
    : err.message.replace(/\/[^ ]+/g, '[path]').replace(/key=[^ &]+/gi, 'key=[redacted]');

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    timestamp: new Date().toISOString(),
  });
}
