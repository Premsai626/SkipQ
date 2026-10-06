import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env explicitly, with fallback to cwd
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const databaseDriver = process.env.DATABASE_DRIVER || (process.env.SUPABASE_URL ? 'supabase' : 'local');
const storageDriver = process.env.STORAGE_DRIVER || (process.env.SUPABASE_URL ? 'supabase' : 'local');
const isSupabaseDriver = databaseDriver === 'supabase' || storageDriver === 'supabase';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? String(process.env.SUPABASE_SERVICE_ROLE_KEY).trim() : '';
const anonKey = process.env.SUPABASE_ANON_KEY ? String(process.env.SUPABASE_ANON_KEY).trim() : '';
const jwtSecretEnv = process.env.JWT_SECRET ? String(process.env.JWT_SECRET).trim() : '';

// --- CONFIGURATION SECURITY VALIDATION ---
// 1. Fail-fast validation when Supabase driver is selected
if (isSupabaseDriver) {
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required when using the Supabase driver.');
  }
  if (anonKey && serviceRoleKey === anonKey) {
    throw new Error('Privilege boundary violation: SUPABASE_SERVICE_ROLE_KEY cannot equal SUPABASE_ANON_KEY.');
  }
}

// 2. Fail-fast validation for JWT Secret in Production
if (nodeEnv === 'production') {
  if (!jwtSecretEnv) {
    throw new Error('JWT_SECRET environment variable is strictly required in production.');
  }
  if (jwtSecretEnv === 'xerox_flow_production_jwt_secret_key_2026') {
    throw new Error('Insecure default JWT_SECRET detected. A unique production secret must be provided.');
  }
  if (jwtSecretEnv.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production.');
  }
}

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv,
  jwtSecret: jwtSecretEnv || (nodeEnv === 'development' ? 'xerox_flow_production_jwt_secret_key_2026' : ''),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',

  // CORS Allowed Origins
  allowedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5001',
    'http://127.0.0.1:5001',
    process.env.FRONTEND_URL,
  ].filter(Boolean),

  // Storage & Database Drivers
  databaseDriver,
  storageDriver,

  // Supabase Configuration (Strict service role key requirement for backend)
  supabaseUrl: (process.env.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, ''),
  supabaseKey: serviceRoleKey,
  supabaseAnonKey: anonKey,
  supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET || 'xerox-documents',

  // Local Uploads Directory
  uploadDir: path.resolve(__dirname, '../../uploads'),
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'],
};
