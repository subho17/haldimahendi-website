import { NextResponse } from 'next/server';
import { checkAdminKey } from '@/lib/adminAuth';
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '@/lib/couponStore';

// GET /api/admin/coupons
export async function GET(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const coupons = await listCoupons();
    return NextResponse.json({ success: true, coupons });
  } catch (e) {
    console.error('Error listing coupons:', e);
    return NextResponse.json({ success: false, message: 'Failed to list coupons' }, { status: 500 });
  }
}

// POST /api/admin/coupons - create
export async function POST(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const coupon = await createCoupon({
      code: String(body.code || '').trim().toUpperCase(),
      discountType: body.discountType,
      discountValue: Number(body.discountValue),
      applicablePlans: Array.isArray(body.applicablePlans) ? body.applicablePlans : [],
      maxUses: Number(body.maxUses) || 1,
      perUserLimit: Number(body.perUserLimit) || 1,
      startsAt: body.startsAt || new Date().toISOString(),
      expiresAt: body.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: body.isActive !== false,
      description: body.description,
    });
    return NextResponse.json({ success: true, coupon });
  } catch (e) {
    console.error('Error creating coupon:', e);
    return NextResponse.json({ success: false, message: 'Failed to create coupon' }, { status: 500 });
  }
}

// PATCH /api/admin/coupons - update
export async function PATCH(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const id = String(body.id || '').trim();
    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });

    const patch: Partial<{
      code: string;
      discountType: 'percent' | 'flat';
      discountValue: number;
      applicablePlans: string[];
      maxUses: number;
      perUserLimit: number;
      startsAt: string;
      expiresAt: string;
      isActive: boolean;
      description: string;
    }> = {};

    if (body.code) patch.code = String(body.code).trim().toUpperCase();
    if (body.discountType) patch.discountType = body.discountType;
    if (body.discountValue !== undefined) patch.discountValue = Number(body.discountValue);
    if (body.applicablePlans) patch.applicablePlans = body.applicablePlans;
    if (body.maxUses !== undefined) patch.maxUses = Number(body.maxUses);
    if (body.perUserLimit !== undefined) patch.perUserLimit = Number(body.perUserLimit);
    if (body.startsAt) patch.startsAt = body.startsAt;
    if (body.expiresAt) patch.expiresAt = body.expiresAt;
    if (body.isActive !== undefined) patch.isActive = body.isActive;
    if (body.description !== undefined) patch.description = body.description;

    const updated = await updateCoupon(id, patch);
    if (!updated) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (e) {
    console.error('Error updating coupon:', e);
    return NextResponse.json({ success: false, message: 'Failed to update coupon' }, { status: 500 });
  }
}

// DELETE /api/admin/coupons?id=...
export async function DELETE(req: Request) {
  if (!checkAdminKey(req.headers.get('x-admin-key'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });

    await deleteCoupon(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error deleting coupon:', e);
    return NextResponse.json({ success: false, message: 'Failed to delete coupon' }, { status: 500 });
  }
}