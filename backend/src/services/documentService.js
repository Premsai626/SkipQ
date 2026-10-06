import path from 'path';
import fs from 'fs';
import { getDocumentRepository } from '../repositories/documentRepository.js';
import { orderService } from './orderService.js';
import { StorageService } from './storageService.js';
import { config } from '../config/index.js';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';

export class DocumentService {
  constructor() {
    this.repository = getDocumentRepository();
  }

  /**
   * Helper to locate document metadata from repository or order snapshots.
   * Accepts documentId (e.g. doc_12345678) or unique filename.
   */
  async findDocument(documentIdentifier) {
    if (!documentIdentifier) return null;

    // 1. Direct ID lookup in repository
    let docRecord = await this.repository.findById(documentIdentifier);
    if (docRecord) return docRecord;

    // 2. Filename lookup in repository
    const safeFilename = path.basename(documentIdentifier);
    docRecord = await this.repository.findByFilename(safeFilename);
    if (docRecord) return docRecord;

    // 3. Search in order documents snapshots
    try {
      const ordersResult = await orderService.getOrders({ limit: 1000 });
      const orders = ordersResult?.orders || [];
      for (const order of orders) {
        if (Array.isArray(order.documents)) {
          const match = order.documents.find(
            (d) =>
              d.id === documentIdentifier ||
              d.filename === safeFilename ||
              d.filename === documentIdentifier ||
              (d.storagePath && d.storagePath.endsWith(safeFilename))
          );
          if (match) {
            return {
              id: match.id || documentIdentifier,
              ownerId: order.studentId,
              name: match.name || safeFilename,
              filename: match.filename || safeFilename,
              size: match.size || 0,
              type: match.type || 'application/pdf',
              pages: match.pages || 1,
              storagePath: match.storagePath || `orders/${match.filename || safeFilename}`,
              orderId: order.id,
            };
          }
        }
      }
    } catch (err) {
      console.warn('[DocumentService] Order search notice:', err.message);
    }

    return null;
  }

  /**
   * Finds the order associated with a given document record or identifier.
   */
  async findAssociatedOrder(docRecord, documentIdentifier) {
    try {
      const safeFilename = path.basename(docRecord?.filename || documentIdentifier || '');
      const ordersResult = await orderService.getOrders({ limit: 1000 });
      const orders = ordersResult?.orders || [];
      return (
        orders.find(
          (order) =>
            Array.isArray(order.documents) &&
            order.documents.some(
              (d) =>
                (docRecord && d.id === docRecord.id) ||
                d.id === documentIdentifier ||
                d.filename === safeFilename ||
                (docRecord && d.filename === docRecord.filename) ||
                (docRecord && docRecord.storagePath && d.storagePath === docRecord.storagePath)
            )
        ) || null
      );
    } catch (err) {
      console.warn('[DocumentService] Order association check warning:', err.message);
      return null;
    }
  }

  /**
   * Protected Document View Authorization Endpoint.
   * 
   * Strict Authorization Rules:
   * 1. Deactivated accounts must not retain access (HTTP 403)
   * 2. Active staff may access documents associated with orders they are authorized to process
   *    (arbitrary unrelated private storage files are strictly forbidden)
   * 3. Students may only access documents they own or that belong to their orders
   * 4. Unauthorized users receive HTTP 403 Forbidden
   * 5. Non-existent documents receive HTTP 404 Not Found
   * 6. Generates short-lived signed URLs (120s) via Supabase server-side SDK or local streaming
   */
  async getAuthorizedDocumentView(documentIdentifier, user) {
    if (!documentIdentifier) {
      return { status: 400, error: 'Document ID or filename is required' };
    }

    // 1. Account status verification
    if (user?.status === 'deactivated') {
      return {
        status: 403,
        error: 'Forbidden: Your account has been deactivated. Please contact campus administration.',
      };
    }

    // 2. Locate document record
    const docRecord = await this.findDocument(documentIdentifier);
    if (!docRecord) {
      return {
        status: 404,
        error: `Document '${documentIdentifier}' not found`,
      };
    }

    // 3. Find if document is associated with any campus print order
    const associatedOrder = await this.findAssociatedOrder(docRecord, documentIdentifier);

    // 4. Role-based authorization
    let isAuthorized = false;

    if (user?.role === 'staff') {
      // Staff members must only access documents belonging to orders they are authorized to process
      // Reject arbitrary unrelated private storage files
      if (user.status === 'active' && associatedOrder) {
        isAuthorized = true;
      } else if (!associatedOrder) {
        return {
          status: 403,
          error: 'Forbidden: Staff may only access documents associated with active campus print orders',
        };
      }
    } else if (user?.role === 'student') {
      // Students must only access their own documents
      const isOwner = docRecord.ownerId === user.id;
      const isOrderOwner =
        associatedOrder &&
        (associatedOrder.studentId === user.id ||
          (associatedOrder.studentEmail &&
            associatedOrder.studentEmail.toLowerCase() === user.email?.toLowerCase()));

      if (isOwner || isOrderOwner) {
        isAuthorized = true;
      } else {
        return {
          status: 403,
          error: 'Forbidden: You do not have permission to access this document',
        };
      }
    }

    if (!isAuthorized) {
      return {
        status: 403,
        error: 'Forbidden: Unauthorized to access this document',
      };
    }

    // 5. Generate secure access (short-lived signed URL or local stream)
    const safeFilename = path.basename(docRecord.filename);
    const storagePath = docRecord.storagePath || `orders/${safeFilename}`;

    // A. Generate short-lived signed URLs from private Supabase Storage bucket
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          // Short-lived signed URL for in-browser viewing (120 seconds expiration)
          const { data: viewData, error: viewError } = await client.storage
            .from(config.supabaseBucket)
            .createSignedUrl(storagePath, 120);

          if (!viewError && viewData?.signedUrl) {
            // Also generate a download-specific signed URL
            const { data: dlData } = await client.storage
              .from(config.supabaseBucket)
              .createSignedUrl(storagePath, 120, {
                download: docRecord.name || safeFilename,
              });

            return {
              status: 200,
              type: 'signedUrl',
              signedUrl: viewData.signedUrl,
              downloadUrl: dlData?.signedUrl || viewData.signedUrl,
              viewUrl: viewData.signedUrl,
              mimeType: docRecord.type || 'application/octet-stream',
              filename: safeFilename,
              doc: docRecord,
            };
          }
        } catch (supabaseErr) {
          console.warn('[DocumentService] Supabase signed URL generation notice:', supabaseErr.message);
        }
      }
    }

    // B. Check local filesystem
    const localFilePath = path.join(config.uploadDir, safeFilename);
    if (fs.existsSync(localFilePath)) {
      return {
        status: 200,
        type: 'local',
        filePath: localFilePath,
        signedUrl: `/api/v1/documents/file/${safeFilename}`,
        downloadUrl: `/api/v1/documents/file/${safeFilename}?download=true`,
        viewUrl: `/api/v1/documents/file/${safeFilename}`,
        mimeType: docRecord.type || 'application/octet-stream',
        filename: safeFilename,
        doc: docRecord,
      };
    }

    // C. Fallback: try storage download stream if in Supabase but signed URL failed
    const remote = await StorageService.getFileFromStorage(safeFilename, storagePath);
    if (remote) {
      if (remote.type === 'signedUrl') {
        return {
          status: 200,
          type: 'signedUrl',
          signedUrl: remote.url,
          downloadUrl: remote.url,
          viewUrl: remote.url,
          mimeType: docRecord.type || 'application/octet-stream',
          filename: safeFilename,
          doc: docRecord,
        };
      }
      if (remote.type === 'buffer') {
        return {
          status: 200,
          type: 'buffer',
          buffer: remote.buffer,
          signedUrl: `/api/v1/documents/file/${safeFilename}`,
          downloadUrl: `/api/v1/documents/file/${safeFilename}?download=true`,
          viewUrl: `/api/v1/documents/file/${safeFilename}`,
          mimeType: remote.mimeType || docRecord.type || 'application/octet-stream',
          filename: safeFilename,
          doc: docRecord,
        };
      }
    }

    return {
      status: 404,
      error: 'Document content could not be located in campus storage',
    };
  }

  /**
   * Direct File Streaming Endpoint (/documents/file/:filename).
   * Enforces that:
   * - Deactivated accounts receive 403 Forbidden
   * - Active staff can access operational documents
   * - Original document owner can access their document
   * - Student can access documents referenced in their orders
   * - Unrelated students receive 403 Forbidden
   */
  async getAuthorizedFile(rawFilename, user) {
    if (!rawFilename) {
      return { status: 400, error: 'Filename is required' };
    }

    // Prevent directory traversal attacks
    const safeFilename = path.basename(rawFilename);

    // Verify account active status
    if (user?.status === 'deactivated') {
      return {
        status: 403,
        error: 'Forbidden: Your account has been deactivated. Please contact campus administration.',
      };
    }

    // Check if user is active staff
    const isActiveStaff = user?.role === 'staff' && user?.status === 'active';

    let isAuthorized = isActiveStaff;
    let docRecord = null;

    if (!isAuthorized) {
      // Original document owner check (database-backed)
      docRecord = await this.repository.findByFilename(safeFilename);
      if (docRecord && docRecord.ownerId === user?.id) {
        isAuthorized = true;
      } else {
        // Order-based authorization
        const studentOrders = await orderService.getOrders({
          studentId: user?.id,
          studentEmail: user?.email,
        });

        const hasOrderAccess = studentOrders.orders.some((o) =>
          o.documents?.some(
            (d) =>
              d.filename === safeFilename ||
              (d.url && d.url.includes(safeFilename)) ||
              (docRecord && d.id === docRecord.id)
          )
        );

        if (hasOrderAccess) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return {
        status: 403,
        error: 'Forbidden: You do not have permission to access this document',
      };
    }

    // User is authorized. Now retrieve the file.
    // 1. Check local filesystem
    const localFilePath = path.join(config.uploadDir, safeFilename);
    if (fs.existsSync(localFilePath)) {
      return {
        status: 200,
        type: 'local',
        filePath: localFilePath,
        filename: safeFilename,
      };
    }

    // 2. Check Supabase Storage (private bucket)
    const storagePath = docRecord?.storagePath || `orders/${safeFilename}`;
    const remote = await StorageService.getFileFromStorage(safeFilename, storagePath);

    if (remote) {
      if (remote.type === 'buffer') {
        return {
          status: 200,
          type: 'buffer',
          buffer: remote.buffer,
          mimeType: remote.mimeType || docRecord?.type || 'application/octet-stream',
          filename: safeFilename,
        };
      } else if (remote.type === 'signedUrl') {
        return {
          status: 200,
          type: 'signedUrl',
          url: remote.url,
          filename: safeFilename,
        };
      }
    }

    return {
      status: 404,
      error: 'Document not found',
    };
  }
}

export const documentService = new DocumentService();
