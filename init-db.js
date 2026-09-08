const { ensureProfilesTable, ensurePreferencesTable } = require('./matrimonial/lib/db');

async function init() {
  try {
    await ensureProfilesTable();
    console.log('✅ Profiles table ensured/created');
    
    await ensurePreferencesTable();
    console.log('✅ Preferences table ensured/created');
    
    console.log('\n🎯 Now restart your app and the matching algorithm should work!');
  } catch (e) {
    console.error('❌ Error initializing database:', e.message);
  }
}

init();