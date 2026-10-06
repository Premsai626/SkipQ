import { StorageService } from '../services/storageService.js';
import { documentService } from '../services/documentService.js';

export class DocumentController {
  static async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please select a valid document (PDF, PNG, JPG).',
          timestamp: new Date().toISOString(),
        });
      }

      const document = await StorageService.processUploadedFile(req.file, req.user?.id);

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document uploaded and validated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  static async getPresignedUrl(req, res, next) {
    try {
      const { filename, mimeType } = req.query;
      if (!filename || !mimeType) {
        return res.status(400).json({
          success: false,
          message: 'filename and mimeType query parameters are required',
          timestamp: new Date().toISOString(),
        });
      }

      const presigned = await StorageService.getPresignedUploadUrl(filename, mimeType);
      res.json({
        success: true,
        data: presigned,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Protected Document View / Signed URL Access Endpoint.
   * Route: GET /api/v1/documents/:documentId/view
   * 
   * Strict Authorization Rules:
   * 1. Authenticates requester.
   * 2. Evaluates profile role: 'student' or 'staff'.
   * 3. Students can access only documents they own or in their orders.
   * 4. Staff can access documents associated with orders they are authorized to process.
   *    (arbitrary private storage files without order association are rejected with 403).
   * 5. Non-existent documents return 404.
   * 6. Generates short-lived signed URLs from private Supabase bucket.
   * 7. Never exposes service role key to frontend.
   */
  static async viewDocument(req, res, next) {
    try {
      const documentId = req.params.documentId;
      if (!documentId) {
        return res.status(400).json({
          success: false,
          message: 'Document identifier (ID or filename) is required',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await documentService.getAuthorizedDocumentView(documentId, req.user);

      if (result.status === 400) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Bad Request',
          timestamp: new Date().toISOString(),
        });
      }

      if (result.status === 401) {
        return res.status(401).json({
          success: false,
          message: result.error || 'Unauthorized',
          timestamp: new Date().toISOString(),
        });
      }

      if (result.status === 403) {
        return res.status(403).json({
          success: false,
          message: result.error || 'Forbidden: You do not have permission to access this document',
          timestamp: new Date().toISOString(),
        });
      }

      if (result.status === 404) {
        return res.status(404).json({
          success: false,
          message: result.error || 'Document not found',
          timestamp: new Date().toISOString(),
        });
      }

      // If browser direct redirect requested:
      if (req.query.redirect === 'true' || req.headers.accept?.includes('text/html')) {
        if (result.signedUrl) {
          return res.redirect(result.signedUrl);
        }
        if (result.type === 'local' && result.filePath) {
          return res.sendFile(result.filePath);
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          id: result.doc?.id || documentId,
          filename: result.doc?.filename || result.filename,
          name: result.doc?.name || result.filename,
          mimeType: result.mimeType || result.doc?.type || 'application/octet-stream',
          signedUrl: result.signedUrl,
          downloadUrl: result.downloadUrl || result.signedUrl,
          viewUrl: result.signedUrl,
        },
        message: 'Authorized document access generated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Authenticated Document Direct Access Endpoint (/documents/file/:filename).
   * Enforces that:
   * - Active staff can access operational documents
   * - Original document owner can access their document
   * - Student can access documents referenced in their orders
   * - Unrelated students receive 403 Forbidden
   * - Deactivated staff receive 403 Forbidden
   */
  static async getFile(req, res, next) {
    try {
      const result = await documentService.getAuthorizedFile(req.params.filename, req.user);

      if (result.status === 403) {
        return res.status(403).json({
          success: false,
          message: result.error,
          timestamp: new Date().toISOString(),
        });
      }

      if (result.status === 404) {
        return res.status(404).json({
          success: false,
          message: result.error,
          timestamp: new Date().toISOString(),
        });
      }

      if (result.status === 400) {
        return res.status(400).json({
          success: false,
          message: result.error,
          timestamp: new Date().toISOString(),
        });
      }

      if (result.type === 'local') {
        return res.sendFile(result.filePath);
      }

      if (result.type === 'buffer') {
        res.setHeader('Content-Type', result.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${result.filename}"`);
        return res.send(result.buffer);
      }

      if (result.type === 'signedUrl') {
        return res.redirect(result.url);
      }

      return res.status(500).json({
        success: false,
        message: 'Unable to stream requested document',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}
