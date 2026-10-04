import { app } from './app.js';
import { config } from './config/index.js';
import { isSupabaseConfigured, testSupabaseConnection } from './config/supabase.js';

const server = app.listen(config.port, async () => {
  console.log(`=========================================`);
  console.log(`🚀 SkipQ REST API SERVER ACTIVE`);
  console.log(`📡 Port: ${config.port}`);
  console.log(`📦 Database Driver: ${config.databaseDriver}`);
  console.log(`📂 Storage Driver: ${config.storageDriver}`);
  console.log(`🩺 Health: http://localhost:${config.port}/health`);
  console.log(`⚡ Supabase Diagnostic: http://localhost:${config.port}/api/v1/supabase/status`);

  if (isSupabaseConfigured()) {
    console.log(`🔌 Supabase: Checking database connection...`);
    try {
      const status = await testSupabaseConnection();
      if (status.connected) {
        console.log(`✅ Supabase: Connected successfully!`);
      } else {
        console.log(`⚠️ Supabase notice: ${status.message}`);
      }
    } catch (err) {
      console.log(`⚠️ Supabase check notice: ${err.message}`);
    }
  } else {
    console.log(`💡 Note: Running with local in-memory fallback.`);
    console.log(`   Provide SUPABASE_URL & SUPABASE_KEY in backend/.env to switch to real Supabase persistence.`);
  }
  console.log(`=========================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received: Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
