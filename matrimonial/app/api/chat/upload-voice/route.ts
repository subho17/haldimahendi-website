import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabaseClient, DEFAULT_BUCKET } from '@/lib/supabaseClient';

const AUDIO_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'audio');

function ensureAudioDir() {
  if (!fs.existsSync(AUDIO_UPLOADS_DIR)) {
    fs.mkdirSync(AUDIO_UPLOADS_DIR, { recursive: true });
  }
}

function getFileExtension(mimeType: string, originalName?: string): string {
  if (originalName && originalName.includes('.')) {
    const ext = originalName.split('.').pop()?.toLowerCase();
    if (ext && ['webm', 'mp4', 'm4a', 'ogg', 'wav', 'mp3'].includes(ext)) {
      return ext;
    }
  }
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('mp4') || mimeType.includes('m4a') || mimeType.includes('aac')) return 'mp4';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'mp3';
  return 'webm';
}

// POST /api/chat/upload-voice
// Accepts multipart/form-data with `file`, `conversationId`, `senderId`, `duration`
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const conversationId = (formData.get('conversationId') as string) || 'chat';
    const rawDuration = formData.get('duration') as string | null;
    const duration = rawDuration ? Math.max(1, Math.round(Number(rawDuration))) : 1;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No audio file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Audio file is empty' },
        { status: 400 }
      );
    }

    const ext = getFileExtension(file.type, file.name);
    const cleanFileName = `voice_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const storagePath = `chat-audio/${conversationId}/${cleanFileName}`;

    let voiceUrl = '';
    let uploadSuccess = false;

    // 1. Attempt upload to Supabase Storage if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const bucket = (process.env.NEXT_PUBLIC_SUPABASE_BUCKET || DEFAULT_BUCKET || 'chat-audio').trim();
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(storagePath, buffer, {
            contentType: file.type || 'audio/webm',
            upsert: true,
            cacheControl: '31536000',
          });

        if (!error && data?.path) {
          const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

          if (publicUrlData?.publicUrl) {
            voiceUrl = publicUrlData.publicUrl;
            uploadSuccess = true;
          }
        } else if (error) {
          console.warn('[Supabase Voice Upload Warning]', error.message);
        }
      } catch (supabaseErr) {
        console.warn('[Supabase Voice Upload Exception]', supabaseErr);
      }
    }

    // 2. Fallback to local filesystem in public/uploads/audio
    if (!uploadSuccess) {
      ensureAudioDir();
      const localFilePath = path.join(AUDIO_UPLOADS_DIR, cleanFileName);
      fs.writeFileSync(localFilePath, buffer);
      voiceUrl = `/uploads/audio/${cleanFileName}`;
      uploadSuccess = true;
    }

    return NextResponse.json({
      success: true,
      voiceUrl,
      voiceDuration: duration,
      sizeBytes: buffer.length,
    });
  } catch (error) {
    console.error('Error handling voice upload:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process voice upload' },
      { status: 500 }
    );
  }
}
