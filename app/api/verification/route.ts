import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { submitVerification, getVerificationStatus } from '@/lib/verifyStore';

const VERIFICATION_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'verification');

const ID_TYPES = ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id'];

function ensureUploadsDir() {
  if (!fs.existsSync(VERIFICATION_UPLOADS_DIR)) {
    fs.mkdirSync(VERIFICATION_UPLOADS_DIR, { recursive: true });
  }
}

function normalizeId(v?: string | null): string {
  return (v || '').toString().trim();
}

async function saveFile(file: File, userId: string, prefix: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  ensureUploadsDir();
  const fileName = `${userId}_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
  fs.writeFileSync(path.join(VERIFICATION_UPLOADS_DIR, fileName), buffer);
  return `/uploads/verification/${fileName}`;
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

    // Only accept image uploads for safety.
    const isImage = (f: File) => (f.type || '').startsWith('image/');
    if (!isImage(selfie) || !isImage(document)) {
      return NextResponse.json({ success: false, message: 'Please upload image files only' }, { status: 400 });
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
  } catch (e) {
    console.error('Error submitting verification:', e);
    return NextResponse.json({ success: false, message: 'Failed to submit verification' }, { status: 500 });
  }
}
