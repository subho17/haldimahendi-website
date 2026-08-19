import { NextResponse } from "next/server";
import { getMembership, upgradeMembership } from "@/lib/membershipStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get("userId") || "").trim();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Missing userId parameter" }, { status: 400 });
    }
    const membership = await getMembership(userId);
    return NextResponse.json({ success: true, membership });
  } catch (e) {
    console.error("Error loading membership:", e);
    return NextResponse.json({ success: false, message: "Failed to load membership" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = (body?.userId || "").toString().trim();
    const planId = (body?.planId || "").toString().trim();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
    }
    const result = await upgradeMembership(userId, planId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, membership: result.membership, message: result.message });
  } catch (e) {
    console.error("Error upgrading membership:", e);
    return NextResponse.json({ success: false, message: "Failed to upgrade membership" }, { status: 500 });
  }
}