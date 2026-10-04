import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env explicitly, with fallback to cwd
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'xerox_flow_production_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  
  // Administrative Bootstrap Secret
  adminBootstrapKey: process.env.ADMIN_BOOTSTRAP_KEY || 'skipq_admin_bootstrap_secret_2026',

  // CORS Allowed Origins
  allowedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5001',
    'http://127.0.0.1:5001',
    process.env.FRONTEND_URL,
  ].filter(Boolean),

  // Storage & Database Drivers
  databaseDriver: process.env.DATABASE_DRIVER || (process.env.SUPABASE_URL ? 'supabase' : 'local'),
  storageDriver: process.env.STORAGE_DRIVER || (process.env.SUPABASE_URL ? 'supabase' : 'local'),

  // Supabase Configuration
  supabaseUrl: (process.env.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, ''),
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET || 'xerox-documents',

  // AWS Configuration
  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  dynamoDbTable: process.env.DYNAMODB_TABLE_NAME || 'XeroxFlow_Orders',
  s3Bucket: process.env.S3_BUCKET_NAME || 'xerox-flow-documents',
  
  // Local Uploads Directory
  uploadDir: path.resolve(__dirname, '../../uploads'),
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
};
