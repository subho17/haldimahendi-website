import { pool, hasPool, ensureProfilesTable } from "@/lib/db";
import fs from "fs";
import path from "path";

const SCRATCH_DIR = path.join(process.cwd(), "scratch");

const scratchFiles = [
  "users_db.json",
  "verifications_db.json",
  "safety_db.json",
  "reports_db.json",
  "preferences_db.json",
  "photos_db.json",
  "notifications_db.json",
  "interactions_db.json",
  "coupon_usage_db.json",
  "chat_db.json",
  "blocks_db.json",
];

async function clearPostgres() {
  if (!hasPool || !pool) {
    console.log("PostgreSQL not configured, skipping...");
    return;
  }

  console.log("Clearing PostgreSQL tables...");
  
  await ensureProfilesTable();

  const tables = [
    "profiles",
    "partner_preferences", 
    "interests",
    "shortlists",
    "conversations",
    "chat_messages",
    "reports",
    "blocks",
    "notifications",
    "verifications",
    "profile_boosts",
    "contact_credits",
    "featured_profiles",
    "otp_codes",
  ];

  for (const table of tables) {
    try {
      await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
      console.log(`  ✓ Cleared ${table}`);
    } catch (e: unknown) {
      console.log(`  ⚠ Could not clear ${table}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  
  console.log("PostgreSQL cleared!");
}

function clearScratchFiles() {
  console.log("Clearing scratch JSON files...");
  
  for (const file of scratchFiles) {
    const filePath = path.join(SCRATCH_DIR, file);
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]", "utf-8");
        console.log(`  ✓ Cleared ${file}`);
      } else {
        console.log(`  ⚠ ${file} does not exist`);
      }
    } catch (e: unknown) {
      console.log(`  ⚠ Could not clear ${file}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  
  console.log("Scratch files cleared!");
}

async function main() {
  console.log("=== Clearing All Users ===\n");
  
  await clearPostgres();
  console.log("");
  clearScratchFiles();
  
  console.log("\n=== Done! All users removed ===");
  process.exit(0);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});