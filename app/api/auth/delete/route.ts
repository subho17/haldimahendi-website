import { NextResponse } from "next/server";
import { pool, hasPool } from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
    }

    // 1. Delete the profile row from Postgres (if DB is configured)
    if (hasPool) {
      try {
        await pool!.query(
          `DELETE FROM profiles WHERE user_id = $1`,
          [userId]
        );
      } catch (e) {
        console.warn('[AuthDelete] Failed to delete profile:', e);
        // continue even if profile delete fails
      }
    }

    // 2. Sign out the user from Supabase Auth (client-side session clear)
    // We'll return a signal for the frontend to sign out
    return NextResponse.json({ success: true, message: "Account deletion processed" });
  } catch (error) {
    console.error("Error during account deletion:", error);
    return NextResponse.json({ success: false, message: "Server error during deletion" }, { status: 500 });
  }
}