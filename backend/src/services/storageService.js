import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';
import { getDocumentRepository } from '../repositories/documentRepository.js';

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
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);
    const uniqueName = `${Date.now()}_${sanitizedBase}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Validate extension
  if (!config.allowedExtensions.includes(ext)) {
    return cb(
      new Error(
        `Invalid file extension '${ext}'. Allowed file types are: ${config.allowedExtensions.join(', ')}`
      ),
      false
    );
  }

  // Validate MIME type
  if (config.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type '${file.mimetype}'. Allowed formats: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), and Images (.png, .jpg, .jpeg).`
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
   * Save uploaded file record and persist ownership.
   * If Supabase Storage is configured, uploads to private bucket.
   */
  static async processUploadedFile(file, userId) {
    // Default to secure authenticated local endpoint
    let fileUrl = `/api/v1/documents/file/${file.filename}`;
    const storagePath = `orders/${file.filename}`;

    // Upload to Supabase Storage bucket if configured
    if (
      isSupabaseConfigured() &&
      (config.storageDriver === 'supabase' || !config.storageDriver || config.storageDriver === 'local')
    ) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const fileBuffer = fs.readFileSync(file.path);

          const { data, error } = await client.storage
            .from(config.supabaseBucket)
            .upload(storagePath, fileBuffer, {
              contentType: file.mimetype,
              upsert: true,
            });

          if (!error && data) {
            // Secure signed URL with 1-hour expiration (Private Bucket)
            const { data: signedData, error: signError } = await client.storage
              .from(config.supabaseBucket)
              .createSignedUrl(storagePath, 3600);

            if (!signError && signedData?.signedUrl) {
              fileUrl = signedData.signedUrl;
            }
          } else if (error) {
            console.warn('[Storage] Supabase storage upload notice (using local file fallback):', error.message);
          }
        }
      } catch (uploadErr) {
        console.warn('[Storage] Supabase storage upload exception:', uploadErr.message);
      }
    }

    // Estimate page count for PDFs
    let estimatedPages = 1;
    if (file.mimetype === 'application/pdf') {
      estimatedPages = Math.max(1, Math.min(50, Math.ceil(file.size / 200000)));
    }

    // Persist document metadata and ownership to database-backed repository
    const docRepo = getDocumentRepository();
    const docId = `doc_${uuidv4().substring(0, 8)}`;
    const createdAt = new Date().toISOString();

    const docRecord = await docRepo.create({
      id: docId,
      ownerId: userId,
      name: file.originalname,
      filename: file.filename,
      size: file.size,
      type: file.mimetype,
      pages: estimatedPages,
      storagePath,
      createdAt,
    });

    return {
      id: docRecord.id,
      name: docRecord.name,
      filename: docRecord.filename,
      size: docRecord.size,
      type: docRecord.type,
      pages: docRecord.pages,
      url: fileUrl,
      ownerId: userId,
      storagePath: docRecord.storagePath,
      uploadedAt: docRecord.createdAt,
    };
  }

  /**
   * Retrieves an object from Supabase Storage for secure streaming or signed URL redirection.
   * Keeps bucket completely private.
   */
  static async getFileFromStorage(filename, storagePath) {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const client = getSupabaseClient();
    if (!client) {
      return null;
    }

    const resolvedPath = storagePath || `orders/${filename}`;

    // 1. Attempt direct download to stream buffer (keeps bucket private & no external redirects)
    try {
      const { data, error } = await client.storage
        .from(config.supabaseBucket)
        .download(resolvedPath);

      if (!error && data) {
        const arrayBuffer = await data.arrayBuffer();
        return {
          type: 'buffer',
          buffer: Buffer.from(arrayBuffer),
          mimeType: data.type || 'application/octet-stream',
        };
      }
    } catch (downloadErr) {
      console.warn('[Storage] Supabase download stream notice:', downloadErr.message);
    }

    // 2. Fallback: Generate short-lived signed URL (60 seconds)
    try {
      const { data: signedData, error: signError } = await client.storage
        .from(config.supabaseBucket)
        .createSignedUrl(resolvedPath, 60);

      if (!signError && signedData?.signedUrl) {
        return {
          type: 'signedUrl',
          url: signedData.signedUrl,
        };
      }
    } catch (signErr) {
      console.warn('[Storage] Supabase signed URL generation notice:', signErr.message);
    }

    return null;
  }

  /**
   * Presigned upload URL stub (Supabase direct upload / multipart upload used instead)
   */
  static async getPresignedUploadUrl(filename, mimeType) {
    return null;
  }
}
