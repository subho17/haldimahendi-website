import { NextResponse } from "next/server";
import { getMembership, upgradeMembership, MEMBERSHIP_PLANS } from "@/lib/membershipStore";
import { validateCoupon, calculateDiscount, recordCouponUsage, getCouponByCode } from "@/lib/couponStore";

function parsePrice(priceStr: string): number {
  return Number(priceStr.replace(/[^\d]/g, ''));
}

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
    const couponCode = (body?.couponCode || "").toString().trim().toUpperCase();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
    }

    let couponRecord: { code: string; discountAmount: number } | null = null;
    if (couponCode) {
      const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId);
      if (!plan) {
        return NextResponse.json({ success: false, message: "Invalid plan" }, { status: 400 });
      }
      const validation = await validateCoupon(couponCode, planId, userId);
      if (!validation.valid || !validation.coupon) {
        return NextResponse.json({ success: false, message: validation.message }, { status: 400 });
      }
      const discountAmount = calculateDiscount(validation.coupon, parsePrice(plan.price));
      couponRecord = { code: validation.coupon.code, discountAmount };
    }

    const result = await upgradeMembership(userId, planId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    if (couponRecord) {
      const coupon = await getCouponByCode(couponRecord.code);
      if (coupon) {
        await recordCouponUsage(userId, coupon.id);
      }
    }

    return NextResponse.json({ success: true, membership: result.membership, message: result.message, coupon: couponRecord });
  } catch (e) {
    console.error("Error upgrading membership:", e);
    return NextResponse.json({ success: false, message: "Failed to upgrade membership" }, { status: 500 });
  }
}
