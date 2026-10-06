import { v4 as uuidv4 } from 'uuid';
import { getSupabaseClient } from '../config/supabase.js';

export function isUuid(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Transforms a Supabase PostgreSQL row into the application Order domain model.
 */
function mapRowToOrder(row) {
  if (!row) return null;

  return {
    id: row.id,
    token: row.token,
    orderType: row.order_type || row.orderType || (row.items && row.items.length > 0 ? 'STORE' : 'PRINT'),
    studentId: row.student_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    studentPhone: row.student_phone,
    documents: Array.isArray(row.documents) ? row.documents : [],
    config: row.config || {},
    items: Array.isArray(row.items) ? row.items : [],
    pricing: row.pricing || {},
    status: row.status,
    paymentMethod: row.payment_method === 'UPI' ? 'ONLINE' : (row.payment_method || 'CASH'),
    paymentStatus: row.payment_status,
    estimatedMinutes: row.estimated_minutes ?? 10,
    queuePosition: row.queue_position ?? 0,
    pickupCounter: row.pickup_counter || 'Counter #2 (Main Desk)',
    otpCode: row.otp_code,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Transforms an application Order object into a Supabase row.
 */
function mapOrderToRow(order) {
  let dbPaymentMethod = order.paymentMethod || 'UPI';
  if (dbPaymentMethod === 'ONLINE') {
    dbPaymentMethod = 'UPI';
  }

  const row = {
    token: order.token,
    student_name: order.studentName,
    student_email: order.studentEmail,
    student_phone: order.studentPhone,
    documents: order.documents || [],
    config: order.config || {},
    pricing: order.pricing || {},
    status: order.status || 'PENDING',
    payment_method: dbPaymentMethod,
    payment_status: order.paymentStatus || 'PENDING',
    estimated_minutes: order.estimatedMinutes ?? 10,
    queue_position: order.queuePosition ?? 0,
    pickup_counter: order.pickupCounter || 'Counter #2 (Main Desk)',
    otp_code: order.otpCode || null,
    rejection_reason: order.rejectionReason || null,
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: order.updatedAt || new Date().toISOString(),
  };

  if (isUuid(order.id)) {
    row.id = order.id;
  } else {
    row.id = uuidv4();
  }

  if (isUuid(order.studentId)) {
    row.student_id = order.studentId;
  }

  return row;
}

export class SupabaseOrderRepository {
  constructor() {
    this.client = getSupabaseClient();
  }

  getClient() {
    if (!this.client) {
      this.client = getSupabaseClient();
    }
    if (!this.client) {
      throw new Error(
        'Supabase client is not available. Please verify SUPABASE_URL and SUPABASE_KEY in your environment.'
      );
    }
    return this.client;
  }

  async create(order) {
    const client = this.getClient();
    const row = mapOrderToRow(order);

    // Ensure student_id points to an existing profile in Supabase
    let validProfileId = null;
    const email = (order.studentEmail || '').toLowerCase().trim();

    if (row.student_id) {
      try {
        const { data: existingProf } = await client
          .from('profiles')
          .select('id')
          .eq('id', row.student_id)
          .maybeSingle();
        if (existingProf?.id) {
          validProfileId = existingProf.id;
        }
      } catch (err) {
        // Ignore and check email
      }
    }

    if (!validProfileId && email) {
      try {
        const { data: profileByEmail } = await client
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (profileByEmail?.id) {
          validProfileId = profileByEmail.id;
        } else {
          // Provision in auth.users and profiles to satisfy foreign key constraint
          const { data: listData } = await client.auth.admin.listUsers();
          let authUserId = listData?.users?.find((u) => u.email?.toLowerCase() === email)?.id;

          if (!authUserId) {
            const { data: newAuth } = await client.auth.admin.createUser({
              email,
              password: `${uuidv4()}!Xq9`,
              email_confirm: true,
              user_metadata: { name: order.studentName },
            });
            authUserId = newAuth?.user?.id;
          }

          if (authUserId) {
            await client.from('profiles').upsert({
              id: authUserId,
              name: order.studentName || 'Student',
              email,
              role: 'student',
              status: 'active',
              phone: order.studentPhone || '',
            });
            validProfileId = authUserId;
          }
        }
      } catch (authErr) {
        console.warn('[SupabaseOrderRepository] Student auto-provision notice:', authErr.message);
      }
    }

    if (validProfileId) {
      row.student_id = validProfileId;
    }

    let insertedData = null;
    try {
      const { data: firstTry, error: firstErr } = await client
        .from('orders')
        .insert([{
          ...row,
          order_type: order.orderType || 'PRINT',
          items: order.items || [],
        }])
        .select()
        .single();

      if (!firstErr && firstTry) {
        insertedData = firstTry;
      } else {
        // Fallback if custom columns are not yet in remote table schema
        const { data: fallbackData, error: fallbackErr } = await client
          .from('orders')
          .insert([row])
          .select()
          .single();
        if (fallbackErr) {
          throw fallbackErr;
        }
        insertedData = {
          ...fallbackData,
          order_type: order.orderType || 'PRINT',
          items: order.items || [],
        };
      }
    } catch (insertErr) {
      console.error('[SupabaseOrderRepository] Error inserting order:', insertErr);
      throw new Error(`Failed to save order to Supabase: ${insertErr.message}`);
    }

    await this.recalculateQueuePositions();
    return mapRowToOrder(insertedData);
  }

  async findById(idOrToken) {
    if (!idOrToken) return null;
    const client = this.getClient();

    let query = client.from('orders').select('*');
    if (isUuid(idOrToken)) {
      query = query.or(`id.eq.${idOrToken},token.ilike.${idOrToken}`);
    } else {
      query = query.ilike('token', idOrToken);
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      console.error('[SupabaseOrderRepository] Error finding order by ID/Token:', error);
      return null;
    }

    return mapRowToOrder(data);
  }

  async findMany({ status, studentId, studentEmail, search, limit = 50, offset = 0 } = {}) {
    const client = this.getClient();

    let query = client
      .from('orders')
      .select('*', { count: 'exact' });

    const validUuid = studentId && isUuid(studentId);
    if (validUuid || studentEmail) {
      if (validUuid && studentEmail) {
        query = query.or(`student_id.eq.${studentId},student_email.eq.${studentEmail}`);
      } else if (validUuid) {
        query = query.eq('student_id', studentId);
      } else if (studentEmail) {
        query = query.eq('student_email', studentEmail);
      }
    }

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `token.ilike.%${search}%,student_name.ilike.%${search}%,student_email.ilike.%${search}%`
      );
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('[SupabaseOrderRepository] Error fetching orders:', error);
      throw new Error(`Failed to query orders from Supabase: ${error.message}`);
    }

    return {
      orders: (data || []).map(mapRowToOrder),
      total: count || 0,
      limit,
      offset,
    };
  }

  async update(idOrToken, updateFields) {
    const client = this.getClient();

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (updateFields.status !== undefined) updateData.status = updateFields.status;
    if (updateFields.paymentStatus !== undefined) updateData.payment_status = updateFields.paymentStatus;
    if (updateFields.paymentMethod !== undefined) updateData.payment_method = updateFields.paymentMethod;
    if (updateFields.rejectionReason !== undefined) updateData.rejection_reason = updateFields.rejectionReason;
    if (updateFields.estimatedMinutes !== undefined) updateData.estimated_minutes = updateFields.estimatedMinutes;
    if (updateFields.queuePosition !== undefined) updateData.queue_position = updateFields.queuePosition;
    if (updateFields.pickupCounter !== undefined) updateData.pickup_counter = updateFields.pickupCounter;
    if (updateFields.otpCode !== undefined) updateData.otp_code = updateFields.otpCode;
    if (updateFields.documents !== undefined) updateData.documents = updateFields.documents;
    if (updateFields.config !== undefined) updateData.config = updateFields.config;
    if (updateFields.pricing !== undefined) updateData.pricing = updateFields.pricing;

    let query = client.from('orders').update(updateData);
    if (isUuid(idOrToken)) {
      query = query.eq('id', idOrToken);
    } else {
      query = query.ilike('token', idOrToken);
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) {
      console.error('[SupabaseOrderRepository] Error updating order:', error);
      throw new Error(`Failed to update order in Supabase: ${error.message}`);
    }

    if (updateFields.status) {
      await this.recalculateQueuePositions();
    }

    return mapRowToOrder(data);
  }

  async getQueue() {
    const client = this.getClient();

    const activeStatuses = ['PENDING', 'ACCEPTED', 'PAYMENT_VERIFIED', 'PRINTING'];

    const { data, error } = await client
      .from('orders')
      .select('*')
      .in('status', activeStatuses)
      .order('queue_position', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[SupabaseOrderRepository] Error fetching queue:', error);
      return [];
    }

    return (data || []).map(mapRowToOrder);
  }

  async getMetrics() {
    const client = this.getClient();

    try {
      const { data: allOrders, error } = await client
        .from('orders')
        .select('id, status, pricing, config, created_at');

      if (error || !allOrders) {
        throw error || new Error('No orders found');
      }

      const pendingCount = allOrders.filter((o) => o.status === 'PENDING').length;
      const printingCount = allOrders.filter((o) => o.status === 'PRINTING').length;
      const readyCount = allOrders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
      const collectedCount = allOrders.filter((o) => o.status === 'COLLECTED').length;

      const totalRevenue = allOrders.reduce((sum, o) => {
        if (o.status !== 'CANCELLED' && o.status !== 'REJECTED') {
          const amt = Number(o.pricing?.total) || 0;
          return sum + amt;
        }
        return sum;
      }, 0);

      const totalPrinted = allOrders.filter((o) => o.config?.color).length;
      const colorOrders = allOrders.filter((o) => o.config?.color === 'COLOR').length;
      const colorPercentage = totalPrinted > 0 ? Math.round((colorOrders / totalPrinted) * 100) : 0;

      return {
        pendingCount,
        printingCount,
        readyCount,
        completedTodayCount: collectedCount,
        todayRevenue: totalRevenue,
        avgWaitMinutes: (pendingCount + printingCount) > 0 ? (pendingCount + printingCount) * 4 : 0,
        colorPercentage,
        topService: allOrders.length > 0 ? 'Standard Print & Xerox' : 'None yet',
      };
    } catch (err) {
      console.warn('[SupabaseOrderRepository] Metrics calculation notice:', err.message);
      return {
        pendingCount: 0,
        printingCount: 0,
        readyCount: 0,
        completedTodayCount: 0,
        todayRevenue: 0,
        avgWaitMinutes: 0,
        colorPercentage: 0,
        topService: 'None yet',
      };
    }
  }

  async recalculateQueuePositions() {
    try {
      const client = this.getClient();
      const activeStatuses = ['PENDING', 'ACCEPTED', 'PAYMENT_VERIFIED', 'PRINTING'];

      const { data: queueOrders, error } = await client
        .from('orders')
        .select('id, status, created_at')
        .in('status', activeStatuses)
        .order('created_at', { ascending: true });

      if (error || !queueOrders) return;

      for (let i = 0; i < queueOrders.length; i++) {
        const pos = i + 1;
        const estMin = Math.max(3, (pos - 1) * 4 + 3);

        await client
          .from('orders')
          .update({
            queue_position: pos,
            estimated_minutes: estMin,
          })
          .eq('id', queueOrders[i].id);
      }
    } catch (err) {
      console.warn('[SupabaseOrderRepository] Failed to recalculate queue positions:', err.message);
    }
  }
}
