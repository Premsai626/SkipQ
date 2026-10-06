import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';

export class DocumentRepository {
  constructor() {
    // In-memory cache & fallback store for local development/testing
    this.documents = new Map(); // key: filename
    this.documentsById = new Map(); // key: id
  }

  /**
   * Persist a new document record.
   * Saves to Supabase PostgreSQL documents table when configured, with local fallback.
   */
  async create({ id, ownerId, name, filename, size, type, pages = 1, storagePath, createdAt }) {
    const docRecord = {
      id,
      ownerId,
      name,
      filename,
      size: Number(size),
      type,
      pages: Number(pages) || 1,
      storagePath: storagePath || `orders/${filename}`,
      createdAt: createdAt || new Date().toISOString(),
    };

    // 1. Save to in-memory cache/store
    this.documents.set(filename, docRecord);
    this.documentsById.set(id, docRecord);

    // 2. Persist to Supabase PostgreSQL if configured
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('documents')
            .insert({
              id: docRecord.id,
              owner_id: docRecord.ownerId,
              name: docRecord.name,
              filename: docRecord.filename,
              size: docRecord.size,
              type: docRecord.type,
              pages: docRecord.pages,
              storage_path: docRecord.storagePath,
              created_at: docRecord.createdAt,
            })
            .select()
            .single();

          if (error) {
            console.warn('[DocumentRepository] Supabase insert warning (cached locally):', error.message);
          } else if (data) {
            return {
              id: data.id,
              ownerId: data.owner_id,
              name: data.name,
              filename: data.filename,
              size: Number(data.size),
              type: data.type,
              pages: data.pages,
              storagePath: data.storage_path,
              createdAt: data.created_at,
            };
          }
        }
      } catch (dbErr) {
        console.warn('[DocumentRepository] Supabase insert exception:', dbErr.message);
      }
    }

    return docRecord;
  }

  /**
   * Find document metadata and ownership by unique stored filename.
   */
  async findByFilename(filename) {
    if (!filename) return null;

    // 1. Check Supabase PostgreSQL if configured
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('documents')
            .select('*')
            .eq('filename', filename)
            .maybeSingle();

          if (!error && data) {
            const record = {
              id: data.id,
              ownerId: data.owner_id,
              name: data.name,
              filename: data.filename,
              size: Number(data.size),
              type: data.type,
              pages: data.pages,
              storagePath: data.storage_path,
              createdAt: data.created_at,
            };
            // Sync to in-memory cache
            this.documents.set(filename, record);
            this.documentsById.set(record.id, record);
            return record;
          }
        }
      } catch (err) {
        console.warn('[DocumentRepository] Supabase findByFilename exception:', err.message);
      }
    }

    // 2. Fallback to in-memory store
    return this.documents.get(filename) || null;
  }

  /**
   * Find document by document ID.
   */
  async findById(id) {
    if (!id) return null;

    // 1. Check Supabase PostgreSQL if configured
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('documents')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (!error && data) {
            const record = {
              id: data.id,
              ownerId: data.owner_id,
              name: data.name,
              filename: data.filename,
              size: Number(data.size),
              type: data.type,
              pages: data.pages,
              storagePath: data.storage_path,
              createdAt: data.created_at,
            };
            this.documents.set(record.filename, record);
            this.documentsById.set(record.id, record);
            return record;
          }
        }
      } catch (err) {
        console.warn('[DocumentRepository] Supabase findById exception:', err.message);
      }
    }

    return this.documentsById.get(id) || null;
  }

  /**
   * Find all documents uploaded by a specific user.
   */
  async findByOwnerId(ownerId) {
    if (!ownerId) return [];

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('documents')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });

          if (!error && data) {
            return data.map((d) => ({
              id: d.id,
              ownerId: d.owner_id,
              name: d.name,
              filename: d.filename,
              size: Number(d.size),
              type: d.type,
              pages: d.pages,
              storagePath: d.storage_path,
              createdAt: d.created_at,
            }));
          }
        }
      } catch (err) {
        console.warn('[DocumentRepository] Supabase findByOwnerId exception:', err.message);
      }
    }

    return Array.from(this.documents.values()).filter((d) => d.ownerId === ownerId);
  }
}

// Singleton repository instance
let instance = null;

export function getDocumentRepository() {
  if (!instance) {
    instance = new DocumentRepository();
  }
  return instance;
}
