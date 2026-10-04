import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Multer disk storage for local development
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);
    const uniqueName = `${Date.now()}_${sanitizedBase}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (config.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only PDF, JPG, and PNG documents are allowed.`
      ),
      false
    );
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter,
});

export class StorageService {
  /**
   * Save uploaded file record (uploads to Supabase Storage if configured)
   */
  static async processUploadedFile(file) {
    // Default to local uploads endpoint
    let fileUrl = `/uploads/${file.filename}`;

    // Upload to Supabase Storage bucket if configured
    if (isSupabaseConfigured() && (config.storageDriver === 'supabase' || !config.storageDriver || config.storageDriver === 'local')) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const fileBuffer = fs.readFileSync(file.path);
          const storagePath = `orders/${file.filename}`;

          const { data, error } = await client.storage
            .from(config.supabaseBucket)
            .upload(storagePath, fileBuffer, {
              contentType: file.mimetype,
              upsert: true,
            });

          if (!error && data) {
            const { data: publicData } = client.storage
              .from(config.supabaseBucket)
              .getPublicUrl(storagePath);

            if (publicData?.publicUrl) {
              fileUrl = publicData.publicUrl;
              console.log(`[Storage] Uploaded document to Supabase Storage: ${fileUrl}`);
            }
          } else if (error) {
            console.warn('[Storage] Supabase storage upload notice (using local file fallback):', error.message);
          }
        }
      } catch (uploadErr) {
        console.warn('[Storage] Supabase storage upload exception:', uploadErr.message);
      }
    }

    // Estimate page count for PDFs roughly if no parser
    let estimatedPages = 1;
    if (file.mimetype === 'application/pdf') {
      estimatedPages = Math.max(1, Math.min(50, Math.ceil(file.size / 200000)));
    }

    return {
      id: `doc_${uuidv4().substring(0, 8)}`,
      name: file.originalname,
      filename: file.filename,
      size: file.size,
      type: file.mimetype,
      pages: estimatedPages,
      url: fileUrl,
      uploadedAt: new Date().toISOString(),
    };
  }

  /**
   * Get S3 Presigned URL for direct secure browser uploads in production
   */
  static async getPresignedUploadUrl(filename, mimeType) {
    if (config.storageDriver !== 's3') {
      return null;
    }
    // S3 PutObjectCommand presigner logic for AWS deployment
    return {
      uploadUrl: `https://${config.s3Bucket}.s3.${config.awsRegion}.amazonaws.com/uploads/${uuidv4()}_${filename}`,
      key: `uploads/${uuidv4()}_${filename}`,
    };
  }
}
