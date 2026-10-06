import { v4 as uuidv4 } from 'uuid';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';

export class StoreRepository {
  constructor() {
    this.items = new Map();
    this.seedDefaultItems();
  }

  seedDefaultItems() {
    const defaults = [
      {
        id: 'item_apron_01',
        name: 'Campus Lab Apron (White Cotton)',
        description: 'Standard laboratory dress code with dual chest pen slots and reinforced side vents.',
        category: 'Lab Apparel',
        price: 280,
        stock: 50,
        imageUrl: '/images/apron.png',
        isAvailable: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item_files_02',
        name: 'Assignment Stick Files (Pack of 5)',
        description: 'Transparent high-clarity front cover with non-slip fluorescent spine locking clips.',
        category: 'Filing & Submission',
        price: 45,
        stock: 150,
        imageUrl: '/images/stick_files.png',
        isAvailable: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item_graph_03',
        name: 'Engineering Graph Book (60 Pgs)',
        description: 'High-precision millimeter grid pages for Physics, Chemistry, and CAD laboratory readings.',
        category: 'Notebooks & Records',
        price: 35,
        stock: 100,
        imageUrl: '/images/graph_book.png',
        isAvailable: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item_a3_04',
        name: 'A3 Drawing Sheets (Pack of 10)',
        description: 'Heavyweight 140 GSM drafting paper tailored for Engineering Drawing boards.',
        category: 'Engineering Graphics',
        price: 60,
        stock: 80,
        imageUrl: '/images/a3_sheets.png',
        isAvailable: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item_notebook_05',
        name: 'Executive Spiral Notebook (200 Pgs)',
        description: '80 GSM smooth bond paper with perforated tear-out sheets and spill-resistant poly cover.',
        category: 'Notebooks & Records',
        price: 110,
        stock: 75,
        imageUrl: '/images/notebook.png',
        isAvailable: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item_pilot_06',
        name: 'Pilot V5 Hi-Tecpoint Pen (Black/Blue)',
        description: '0.5mm stainless steel precision tip with liquid ink feed for examination writing.',
        category: 'Writing Instruments',
        price: 55,
        stock: 120,
        imageUrl: '/images/pilot_pen.png',
        isAvailable: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const item of defaults) {
      this.items.set(item.id, item);
    }
  }

  formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      category: row.category || 'Stationery',
      price: Number(row.price),
      stock: Number(row.stock),
      imageUrl: row.image_url || row.imageUrl || '',
      isAvailable: row.is_available ?? row.isAvailable ?? true,
      createdBy: row.created_by || row.createdBy || '',
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt,
    };
  }

  async findAll({ category, search, availableOnly = false } = {}) {
    // 1. Try Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          let query = client.from('store_items').select('*').order('created_at', { ascending: false });

          if (availableOnly) {
            query = query.eq('is_available', true);
          }
          if (category && category !== 'ALL') {
            query = query.eq('category', category);
          }

          const { data, error } = await query;
          if (!error && Array.isArray(data) && data.length > 0) {
            let result = data.map((d) => this.formatRow(d));
            if (search) {
              const q = search.toLowerCase();
              result = result.filter(
                (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
              );
            }
            // Update in-memory cache
            for (const item of result) {
              this.items.set(item.id, item);
            }
            return result;
          }
        }
      } catch (err) {
        // Fallback to in-memory store
      }
    }

    // 2. In-memory store fallback
    let items = Array.from(this.items.values());

    if (availableOnly) {
      items = items.filter((i) => i.isAvailable);
    }
    if (category && category !== 'ALL') {
      items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findById(id) {
    if (!id) return null;

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client.from('store_items').select('*').eq('id', id).maybeSingle();
          if (!error && data) {
            const formatted = this.formatRow(data);
            this.items.set(formatted.id, formatted);
            return formatted;
          }
        }
      } catch (err) {
        // Fallback
      }
    }

    return this.items.get(id) || null;
  }

  async create(data) {
    const id = data.id || `item_${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const record = {
      id,
      name: data.name,
      description: data.description || '',
      category: data.category || 'Stationery',
      price: Number(data.price),
      stock: Number(data.stock),
      imageUrl: data.imageUrl || data.image_url || '',
      isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
      createdBy: data.createdBy || data.created_by || '',
      createdAt: now,
      updatedAt: now,
    };

    // Save to memory
    this.items.set(id, record);

    // Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          await client.from('store_items').insert({
            id: record.id,
            name: record.name,
            description: record.description,
            category: record.category,
            price: record.price,
            stock: record.stock,
            image_url: record.imageUrl,
            is_available: record.isAvailable,
            created_by: record.createdBy || null,
            created_at: record.createdAt,
            updated_at: record.updatedAt,
          });
        }
      } catch (err) {
        // Cached locally
      }
    }

    return record;
  }

  async update(id, updates) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : existing.price,
      stock: updates.stock !== undefined ? Number(updates.stock) : existing.stock,
      isAvailable: updates.isAvailable !== undefined ? Boolean(updates.isAvailable) : existing.isAvailable,
      updatedAt: new Date().toISOString(),
    };

    this.items.set(id, updated);

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          await client
            .from('store_items')
            .update({
              name: updated.name,
              description: updated.description,
              category: updated.category,
              price: updated.price,
              stock: updated.stock,
              image_url: updated.imageUrl,
              is_available: updated.isAvailable,
              updated_at: updated.updatedAt,
            })
            .eq('id', id);
        }
      } catch (err) {
        // Cached locally
      }
    }

    return updated;
  }

  async delete(id) {
    const existing = await this.findById(id);
    if (!existing) return false;

    this.items.delete(id);

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          await client.from('store_items').delete().eq('id', id);
        }
      } catch (err) {
        // Removed locally
      }
    }

    return true;
  }

  async decrementStock(id, quantity) {
    const item = await this.findById(id);
    if (!item) {
      throw new Error(`Store item '${id}' not found`);
    }

    if (item.stock < quantity) {
      throw new Error(
        `Insufficient stock for '${item.name}'. Requested ${quantity}, but only ${item.stock} available.`
      );
    }

    const newStock = item.stock - quantity;
    const isAvailable = newStock > 0 ? item.isAvailable : false;

    return this.update(id, {
      stock: newStock,
      isAvailable,
    });
  }
}

// Singleton repository
let storeInstance = null;
export function getStoreRepository() {
  if (!storeInstance) {
    storeInstance = new StoreRepository();
  }
  return storeInstance;
}
