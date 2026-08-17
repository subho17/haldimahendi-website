import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { saveProfile } from '@/lib/otpStore';
import { getSupabaseClient, DEFAULT_BUCKET } from '@/lib/supabaseClient';

const USERS_FILE = path.join(process.cwd(), 'scratch', 'users_db.json');
const PHOTOS_FILE = path.join(process.cwd(), 'scratch', 'photos_db.json');
const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

interface PhotoRecord {
  id: string;
  userId: string;
  url: string;
  createdAt: string;
  isMain?: boolean;
}

function ensurePhotosFile() {
  const dir = path.dirname(PHOTOS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(PHOTOS_FILE)) {
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify([], null, 2));
  }
}

function ensurePublicUploadsDir() {
  if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
    fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
  }
}

// GET /api/photos/upload?userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'default_user';

    ensurePhotosFile();
    let photos: PhotoRecord[] = [];
    try {
      const data = fs.readFileSync(PHOTOS_FILE, 'utf-8');
      photos = JSON.parse(data || '[]');
    } catch {
      photos = [];
    }

    const userPhotos = photos.filter((p) => p.userId === userId);
    return NextResponse.json({ success: true, photos: userPhotos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch photos' }, { status: 500 });
  }
}

// POST /api/photos/upload (Supports FormData file upload to Supabase Storage OR JSON link registration)
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let userId = 'default_user';
    let photoUrl = '';
    let isMain = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      userId = (formData.get('userId') as string) || 'default_user';
      isMain = formData.get('isMain') === 'true';

      if (!file) {
        return NextResponse.json({ success: false, message: 'No file provided in form data' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
      const fileName = `user-photos/${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanName}.${fileExt}`;

      // 1. Try uploading to Supabase Storage from server side
      const supabase = getSupabaseClient();
      let uploadSuccess = false;

      if (supabase) {
        try {
          const cleanBucket = (process.env.NEXT_PUBLIC_SUPABASE_BUCKET || DEFAULT_BUCKET).trim();
          const { data, error } = await supabase.storage
            .from(cleanBucket)
            .upload(fileName, buffer, {
              contentType: file.type || 'image/jpeg',
              upsert: true,
              cacheControl: '3600',
            });

          if (!error && data?.path) {
            const { data: publicUrlData } = supabase.storage
              .from(cleanBucket)
              .getPublicUrl(data.path);

            if (publicUrlData?.publicUrl) {
              photoUrl = publicUrlData.publicUrl;
              uploadSuccess = true;
            }
          } else if (error) {
            console.warn('[Supabase Server Upload Warning]', error.message);
          }
        } catch (err) {
          console.warn('[Supabase Server Upload Exception]', err);
        }
      }

      // 2. Fallback to local public uploads if Supabase is unconfigured or unreachable
      if (!uploadSuccess) {
        ensurePublicUploadsDir();
        const localFileName = `${Date.now()}_${cleanName}.${fileExt}`;
        const localPath = path.join(PUBLIC_UPLOADS_DIR, localFileName);
        fs.writeFileSync(localPath, buffer);
        photoUrl = `/uploads/${localFileName}`;
      }

    } else {
      // JSON payload mode
      const body = await req.json();
      userId = body.userId || 'default_user';
      photoUrl = body.photoUrl || '';
      isMain = !!body.isMain;
    }

    if (!photoUrl) {
      return NextResponse.json({ success: false, message: 'Missing photoUrl parameter' }, { status: 400 });
    }

    ensurePhotosFile();
    let photos: PhotoRecord[] = [];
    try {
      const data = fs.readFileSync(PHOTOS_FILE, 'utf-8');
      photos = JSON.parse(data || '[]');
    } catch {
      photos = [];
    }

    const newPhoto: PhotoRecord = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      url: photoUrl,
      createdAt: new Date().toISOString(),
      isMain,
    };

    if (isMain || photos.filter((p) => p.userId === userId).length === 0) {
      newPhoto.isMain = true;
      photos = photos.map((p) => (p.userId === userId ? { ...p, isMain: false } : p));
    }

    photos.unshift(newPhoto);
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2));

    // Update avatarUrl in user profile
    if (newPhoto.isMain) {
      try {
        if (fs.existsSync(USERS_FILE)) {
          const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
          const users = JSON.parse(usersData || '[]');
          const userIdx = users.findIndex(
            (u: { profileId?: string; mobileNumber?: string; email?: string }) =>
              u.profileId === userId || u.mobileNumber === userId || u.email === userId
          );
          if (userIdx >= 0) {
            users[userIdx].avatarUrl = photoUrl;
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
          }
        }

        await saveProfile({
          userId,
          displayName: 'Member',
          mobileNumber: userId.startsWith('+') ? userId : '',
          avatarUrl: photoUrl,
          provider: 'otp',
        });
      } catch (e) {
        console.warn('Could not sync avatar URL to user profile:', e);
      }
    }

    return NextResponse.json({
      success: true,
      photo: newPhoto,
      photos: photos.filter((p) => p.userId === userId),
    });
  } catch (error) {
    console.error('Error in photo upload route:', error);
    return NextResponse.json({ success: false, message: 'Failed to process photo upload' }, { status: 500 });
  }
}

// DELETE /api/photos/upload?id=...&userId=...
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get('id');
    const userId = searchParams.get('userId') || 'default_user';

    if (!photoId) {
      return NextResponse.json({ success: false, message: 'Missing photo id' }, { status: 400 });
    }

    ensurePhotosFile();
    let photos: PhotoRecord[] = [];
    try {
      const data = fs.readFileSync(PHOTOS_FILE, 'utf-8');
      photos = JSON.parse(data || '[]');
    } catch {
      photos = [];
    }

    photos = photos.filter((p) => !(p.id === photoId && p.userId === userId));
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2));

    return NextResponse.json({ success: true, photos: photos.filter((p) => p.userId === userId) });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete photo' }, { status: 500 });
  }
}
