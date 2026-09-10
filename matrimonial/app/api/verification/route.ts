import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { submitVerification, getVerificationStatus } from '@/lib/verifyStore';
import { getSupabaseClient, DEFAULT_BUCKET } from '@/lib/supabaseClient';
import { isImageFile } from '@/lib/imageUtils';

const VERIFICATION_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'verification');

const ID_TYPES = ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id'];

function ensureUploadsDir() {
  try {
    if (!fs.existsSync(VERIFICATION_UPLOADS_DIR)) {
      fs.mkdirSync(VERIFICATION_UPLOADS_DIR, { recursive: true });
    }
  } catch {
    // Read-only filesystem in serverless environments
  }
}

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

function resolveContentType(file: File, fileExt: string): string {
  const mime = (file.type || '').toLowerCase();
  if (mime && mime !== 'application/octet-stream') {
    return mime;
  }
  if (fileExt === 'heic' || fileExt === 'heif') return 'image/heic';
  if (fileExt === 'png') return 'image/png';
  if (fileExt === 'webp') return 'image/webp';
  return 'image/jpeg';
}

async function saveFile(file: File, userId: string, prefix: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileNameStr = file.name || 'upload.jpg';
  const fileExt = fileNameStr.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `verification/${userId}_${cleanPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
  const contentType = resolveContentType(file, fileExt);

  // 1. Try uploading to Supabase Storage first (primary for production & serverless)
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const bucket = (process.env.NEXT_PUBLIC_SUPABASE_BUCKET || DEFAULT_BUCKET).trim();
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType,
          upsert: true,
          cacheControl: '3600',
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn('[Verification] Supabase storage upload warning:', error.message);
      }
    } catch (err) {
      console.warn('[Verification] Supabase storage upload exception:', err);
    }
  }

  // 2. Fallback to local public uploads (for local development)
  try {
    ensureUploadsDir();
    const localFileName = `${userId}_${cleanPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
    fs.writeFileSync(path.join(VERIFICATION_UPLOADS_DIR, localFileName), buffer);
    return `/uploads/verification/${localFileName}`;
  } catch (fsErr) {
    console.warn('[Verification] Local filesystem write failed (read-only environment):', fsErr);
    // 3. Fallback: Base64 data URL if on read-only serverless and Supabase is unavailable
    const base64 = buffer.toString('base64');
    const mime = contentType || 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  }
}

// GET /api/verification?userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = normalizeId(searchParams.get('userId'));
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }

    const result = await getVerificationStatus(userId);
    return NextResponse.json({
      success: true,
      verified: result.verified,
      submission: result.submission
        ? {
            id: result.submission.id,
            status: result.submission.status,
            idType: result.submission.idType,
            createdAt: result.submission.createdAt,
            reviewedAt: result.submission.reviewedAt,
          }
        : null,
    });
  } catch (e) {
    console.error('Error loading verification status:', e);
    return NextResponse.json({ success: false, message: 'Failed to load verification status' }, { status: 500 });
  }
}

// POST /api/verification  (multipart/form-data)
// Fields: userId, idType, idNumber, selfie (file), document (file)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = normalizeId(formData.get('userId') as string);
    const idType = String(formData.get('idType') || '').trim();
    const idNumber = String(formData.get('idNumber') || '').trim().slice(0, 50);
    const selfie = formData.get('selfie') as File | null;
    const document = formData.get('document') as File | null;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }
    if (!ID_TYPES.includes(idType)) {
      return NextResponse.json({ success: false, message: 'Please select a valid ID type' }, { status: 400 });
    }
    if (idNumber.length < 4) {
      return NextResponse.json({ success: false, message: 'Please enter a valid ID number' }, { status: 400 });
    }
    if (!selfie || !document) {
      return NextResponse.json({ success: false, message: 'Both a clear selfie and an ID document are required' }, { status: 400 });
    }

    // Only accept image uploads for safety (supports JPG, PNG, WebP, HEIC/HEIF).
    if (!isImageFile(selfie) || !isImageFile(document)) {
      return NextResponse.json({ success: false, message: 'Please upload image files only (JPG, PNG, WebP, HEIC)' }, { status: 400 });
    }

    const selfieUrl = await saveFile(selfie, userId, 'selfie');
    const documentUrl = await saveFile(document, userId, 'doc');

    const submission = await submitVerification({
      userId,
      idType,
      idNumber,
      selfieUrl,
      documentUrl,
    });

    if (!submission) {
      return NextResponse.json({ success: false, message: 'Failed to submit verification' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification submitted. Our team will review it shortly.',
      submission: { id: submission.id, status: submission.status },
    });
  } catch (e: unknown) {
    console.error('Error submitting verification:', e);
    return NextResponse.json({ success: false, message: 'Failed to submit verification: ' + (e instanceof Error ? e.message : 'Unknown error') }, { status: 500 });
  }
}
