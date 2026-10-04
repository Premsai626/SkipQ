import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err);

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

  // Multer error
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
      timestamp: new Date().toISOString(),
    });
  }

  const statusCode = err.statusCode || (err.message.includes('not found') ? 404 : 400);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
}
