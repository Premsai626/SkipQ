import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'xerox-documents';

console.log('===========================================================');
console.log('🚀 SKIPQ SUPABASE CONNECTION & VERIFICATION DIAGNOSTIC');
console.log('===========================================================');

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('your-project-id')) {
  console.log('❌ Supabase credentials are not configured yet in backend/.env');
  console.log('\nTo configure Supabase:');
  console.log('1. Open your Supabase project (https://supabase.com/dashboard)');
  console.log('2. Go to Project Settings -> API');
  console.log('3. Copy your "Project URL" into SUPABASE_URL in backend/.env');
  console.log('4. Copy your "service_role" secret key into SUPABASE_SERVICE_ROLE_KEY');
  console.log('5. In Supabase SQL Editor, run supabase/schema.sql');
  console.log('===========================================================');
  process.exit(0);
}

console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Supabase Key: ${SUPABASE_KEY.substring(0, 12)}... (len: ${SUPABASE_KEY.length})`);
console.log(`📦 Storage Bucket: ${STORAGE_BUCKET}`);
console.log('-----------------------------------------------------------');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

async function runDiagnostic() {
  let allHealthy = true;

  // 1. Check Orders Table
  try {
    const { data, count, error } = await supabase
      .from('orders')
      .select('id, token, status', { count: 'exact' })
      .limit(5);

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Orders Table: NOT FOUND');
        console.log('   Action: Run supabase/schema.sql in Supabase SQL Editor.');
      } else {
        console.log(`❌ Orders Table Error: ${error.message} (code: ${error.code})`);
      }
      allHealthy = false;
    } else {
      console.log(`✅ Orders Table: OK (Found ${count ?? data?.length ?? 0} records)`);
      if (data && data.length > 0) {
        console.log('   Recent tokens:', data.map((o) => o.token).join(', '));
      }
    }
  } catch (err) {
    console.log(`❌ Orders Table Exception: ${err.message}`);
    allHealthy = false;
  }

  // 2. Check Profiles Table
  try {
    const { data, count, error } = await supabase
      .from('profiles')
      .select('id, name, email, role', { count: 'exact' })
      .limit(5);

    if (error) {
      console.log(`❌ Profiles Table Error: ${error.message}`);
      allHealthy = false;
    } else {
      console.log(`✅ Profiles Table: OK (Found ${count ?? data?.length ?? 0} profiles)`);
    }
  } catch (err) {
    console.log(`❌ Profiles Table Exception: ${err.message}`);
    allHealthy = false;
  }

  // 3. Check Notifications Table
  try {
    const { data, count, error } = await supabase
      .from('notifications')
      .select('id, title', { count: 'exact' })
      .limit(5);

    if (error) {
      console.log(`❌ Notifications Table Error: ${error.message}`);
      allHealthy = false;
    } else {
      console.log(`✅ Notifications Table: OK (Found ${count ?? data?.length ?? 0} notifications)`);
    }
  } catch (err) {
    console.log(`❌ Notifications Table Exception: ${err.message}`);
    allHealthy = false;
  }

  // 4. Check Documents Table
  try {
    const { data, count, error } = await supabase
      .from('documents')
      .select('id, name, filename, owner_id', { count: 'exact' })
      .limit(5);

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        console.log('⚠️ Documents Table: NOT FOUND in Supabase.');
        console.log('   Action: Run supabase/migrations/20261004_add_documents_table.sql in Supabase SQL Editor.');
      } else {
        console.log(`❌ Documents Table Error: ${error.message}`);
      }
      allHealthy = false;
    } else {
      console.log(`✅ Documents Table: OK (Found ${count ?? data?.length ?? 0} documents)`);
    }
  } catch (err) {
    console.log(`❌ Documents Table Exception: ${err.message}`);
    allHealthy = false;
  }

  // 5. Check Storage Bucket
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log(`⚠️ Storage Buckets Warning: ${error.message}`);
    } else {
      const foundBucket = buckets?.find((b) => b.id === STORAGE_BUCKET || b.name === STORAGE_BUCKET);
      if (foundBucket) {
        console.log(`✅ Storage Bucket '${STORAGE_BUCKET}': OK (Public: ${foundBucket.public})`);
      } else {
        console.log(`⚠️ Storage Bucket '${STORAGE_BUCKET}' not found in bucket list.`);
        console.log(`   (It will be created if you run supabase/schema.sql)`);
      }
    }
  } catch (err) {
    console.log(`⚠️ Storage Bucket check exception: ${err.message}`);
  }

  console.log('===========================================================');
  if (allHealthy) {
    console.log('🎉 SUPABASE BACKEND IS FULLY CONNECTED & READY!');
    console.log('Orders, profiles, and queue state will persist in Supabase PostgreSQL.');
  } else {
    console.log('⚠️ Some tables need setup. Please run supabase/schema.sql');
    console.log('   in your Supabase project SQL Editor to initialize all tables.');
  }
  console.log('===========================================================');
}

runDiagnostic();
