import path from 'path';
import fs from 'fs';
import { StorageService } from '../services/storageService.js';
import { config } from '../config/index.js';
import { orderService } from '../services/orderService.js';

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
   * Authenticated Document Access Endpoint.
   * Replaces insecure static directory serving.
   * Enforces that students can access only documents belonging to their own orders,
   * while staff and admin can access operational documents.
   */
  static async getFile(req, res, next) {
    try {
      const rawFilename = req.params.filename;
      // Prevent directory traversal attacks
      const safeFilename = path.basename(rawFilename);
      const filePath = path.join(config.uploadDir, safeFilename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
          timestamp: new Date().toISOString(),
        });
      }

      // Authorization Check
      const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';

      if (!isStaffOrAdmin) {
        // Verify student owns an order referencing this document
        const studentOrders = await orderService.getOrders({
          studentId: req.user.id,
          studentEmail: req.user.email,
        });

        const hasAccess = studentOrders.orders.some((o) =>
          o.documents?.some(
            (d) =>
              d.filename === safeFilename ||
              (d.url && d.url.includes(safeFilename))
          )
        );

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You do not have permission to access this document',
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Stream file safely
      res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  }
}
