import { StorageService } from '../services/storageService.js';

export class DocumentController {
  static async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please select a valid document (PDF, PNG, JPG).',
        });
      }

      const document = await StorageService.processUploadedFile(req.file);

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
}
