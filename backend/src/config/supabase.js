import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

let supabaseInstance = null;

/**
 * Checks whether valid Supabase configuration credentials are provided.
 */
export function isSupabaseConfigured() {
  return Boolean(
    config.supabaseUrl &&
    config.supabaseUrl.startsWith('https://') &&
    config.supabaseKey &&
    !config.supabaseUrl.includes('your-project')
  );
}

/**
 * Returns the singleton Supabase client.
 * Uses service role key when available (ideal for backend API), or anon key.
 */
export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.supabaseUrl, config.supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log(`[Supabase] Client initialized successfully for ${config.supabaseUrl}`);
    } catch (err) {
      console.error('[Supabase] Failed to initialize Supabase client:', err.message);
      supabaseInstance = null;
    }
  }

  return supabaseInstance;
}

/**
 * Tests connection to Supabase database.
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_KEY in backend/.env',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { connected: false, message: 'Could not create Supabase client' };
  }

  try {
    const { data, error } = await client.from('orders').select('id').limit(1);
    if (error) {
      // Check if table hasn't been created yet
      if (error.code === '42P01') {
        return {
          connected: true,
          tablesReady: false,
          message: 'Connected to Supabase! The "orders" table does not exist yet. Please run supabase/schema.sql in the Supabase SQL Editor.',
        };
      }
      return {
        connected: false,
        message: `Supabase query error: ${error.message} (${error.code || 'unknown'})`,
      };
    }

    return {
      connected: true,
      tablesReady: true,
      message: 'Successfully connected to Supabase and verified tables.',
    };
  } catch (err) {
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${err.message}`,
    };
  }
}
