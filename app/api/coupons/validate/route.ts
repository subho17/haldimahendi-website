import { NextResponse } from 'next/server';
import { validateCoupon, calculateDiscount } from '@/lib/couponStore';
import { MEMBERSHIP_PLANS } from '@/lib/membershipStore';

function parsePrice(priceStr: string): number {
  return Number(priceStr.replace(/[^\d]/g, ''));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body.code || '').trim().toUpperCase();
    const planId = String(body.planId || '').trim();
    const userId = String(body.userId || '').trim();

    if (!code || !planId || !userId) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ success: false, message: 'Invalid plan' }, { status: 400 });
    }

    const result = await validateCoupon(code, planId, userId);
    if (!result.valid || !result.coupon) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    const planPrice = parsePrice(plan.price);
    const discountAmount = calculateDiscount(result.coupon, planPrice);
    const finalPrice = Math.max(0, planPrice - discountAmount);

    return NextResponse.json({
      success: true,
      coupon: result.coupon,
      discountAmount,
      finalPrice,
      originalPrice: planPrice,
    });
  } catch (e) {
    console.error('Coupon validation error:', e);
    return NextResponse.json({ success: false, message: 'Failed to validate coupon' }, { status: 500 });
  }
}