// db.js - Supabase connection helper for Hostinger Web App
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Hostinger sample uses CJS
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

async function testConnection() {
  if (!supabase) {
    console.warn('[db.js] Supabase environment variables not set yet.');
    return;
  }
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      console.error('[db.js] Query error:', error.message);
    } else {
      console.log('[db.js] Successfully connected to Supabase! Sample rows:', data?.length);
    }
  } catch (err) {
    console.error('[db.js] Connection error:', err.message);
  }
}

module.exports = { supabase, testConnection };
