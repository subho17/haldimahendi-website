import { pool, hasPool, ensurePreferencesTable } from '@/lib/db';

async function main() {
  if (!hasPool) {
    console.warn('[populatePreferences] No DB pool, skipping.');
    return;
  }
  await ensurePreferencesTable();

  // Fetch all user_ids from profiles
  const { rows: allUsers } = await pool!.query(
    `SELECT DISTINCT user_id FROM profiles`
  );

  for (const p of allUsers) {
    const userId = p.user_id;

    // Check if a partner_preference row already exists
    const { rows: existing } = await pool!.query(
      `SELECT partner_gender FROM partner_preferences WHERE user_id = $1`,
      [userId]
    );

    let partnerGender: string;
    if (existing.length > 0 && existing[0].partner_gender) {
      partnerGender = existing[0].partner_gender;
    } else {
      // Default to 'both' so the feed filter works out‑of‑the‑box
      partnerGender = 'both';
      // Upsert the row
      await pool!.query(
        `INSERT INTO partner_preferences (user_id, partner_gender)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET partner_gender = EXCLUDED.partner_gender`,
        [userId, partnerGender]
      );
    }
    // Optionally, if gender is known, we could set opposite, but 'both' is safe.
    console.log(`[populatePreferences] user ${userId}: partner_gender = ${partnerGender}`);
  }

  console.log(`[populatePreferences] Processed ${allUsers.length} users.`);
}

main().catch((err) => {
  console.error('Error populating partner preferences:', err);
  process.exit(1);
});