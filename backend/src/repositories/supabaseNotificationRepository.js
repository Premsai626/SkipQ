import { v4 as uuidv4 } from 'uuid';
import { getSupabaseClient } from '../config/supabase.js';

function isUuid(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function mapRowToNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    token: row.token,
    studentId: row.student_id,
    title: row.title,
    message: row.message,
    type: row.type || 'info',
    read: Boolean(row.read),
    timestamp: row.created_at,
  };
}

export class SupabaseNotificationRepository {
  constructor() {
    this.client = getSupabaseClient();
  }

  getClient() {
    if (!this.client) {
      this.client = getSupabaseClient();
    }
    return this.client;
  }

  async create({ id, orderId, token, studentId, title, message, type = 'info' }) {
    const client = this.getClient();
    if (!client) return null;

    let validOrderId = isUuid(orderId) ? orderId : null;
    let validStudentId = isUuid(studentId) ? studentId : null;

    // If orderId is not a UUID, look up order by token
    if (!validOrderId && token) {
      try {
        const { data: ord } = await client
          .from('orders')
          .select('id, student_id')
          .ilike('token', token)
          .maybeSingle();

        if (ord) {
          validOrderId = ord.id;
          if (!validStudentId && ord.student_id) {
            validStudentId = ord.student_id;
          }
        }
      } catch (err) {
        // Continue
      }
    }

    const row = {
      id: isUuid(id) ? id : uuidv4(),
      order_id: validOrderId,
      student_id: validStudentId,
      token,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from('notifications')
      .insert([row])
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[SupabaseNotificationRepository] Failed to insert notification:', error.message);
      return {
        id: id || `notif_${Date.now()}`,
        orderId,
        token,
        studentId,
        title,
        message,
        type,
        read: false,
        timestamp: new Date().toISOString(),
      };
    }

    return mapRowToNotification(data);
  }

  async getAll(studentId) {
    const client = this.getClient();
    if (!client) return [];

    let query = client
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (studentId && isUuid(studentId)) {
      query = query.or(`student_id.eq.${studentId},student_id.is.null`);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('[SupabaseNotificationRepository] Failed to fetch notifications:', error.message);
      return [];
    }

    return (data || []).map(mapRowToNotification);
  }

  async markRead(id, studentId) {
    const client = this.getClient();
    if (!client) return null;

    if (studentId) {
      let checkQuery = client.from('notifications').select('student_id');
      if (isUuid(id)) {
        checkQuery = checkQuery.eq('id', id);
      } else {
        checkQuery = checkQuery.ilike('token', id);
      }
      const { data: existing } = await checkQuery.maybeSingle();
      if (existing && existing.student_id && existing.student_id !== studentId) {
        const err = new Error('Forbidden: You can only update your own notifications');
        err.statusCode = 403;
        throw err;
      }
    }

    let query = client.from('notifications').update({ read: true });
    if (isUuid(id)) {
      query = query.eq('id', id);
    } else {
      query = query.ilike('token', id);
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) {
      console.warn('[SupabaseNotificationRepository] Failed to mark read:', error.message);
      return null;
    }

    return mapRowToNotification(data);
  }

  async markAllRead(studentId) {
    const client = this.getClient();
    if (!client) return;

    let query = client.from('notifications').update({ read: true });
    if (studentId && isUuid(studentId)) {
      query = query.eq('student_id', studentId);
    }

    await query;
  }
}
