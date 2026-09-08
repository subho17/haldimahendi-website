import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const DEFAULT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'profile photos';

const globalForSupabase = globalThis as unknown as {
  supabaseClient: SupabaseClient | undefined;
};

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!globalForSupabase.supabaseClient) {
    globalForSupabase.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return globalForSupabase.supabaseClient;
}

export interface UploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Uploads a File object directly to Supabase Storage bucket and returns the public CDN URL.
 */
export async function uploadImageToSupabase(
  file: File,
  folder: string = 'user-uploads',
  bucketName: string = DEFAULT_BUCKET
): Promise<UploadResult> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: 'Supabase credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.',
    };
  }

  try {
    // Ensure bucket name has no unencoded spaces
    const cleanBucket = (bucketName || 'photos').trim();

    // Generate clean unique filename: folder/timestamp-random-sanitizedname
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 30);
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanName}.${fileExt}`;

    // Upload file to bucket
    const { data, error } = await supabase.storage
      .from(cleanBucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      console.error('[Supabase Storage Upload Error]', error);
      return { success: false, error: error.message };
    }

    // Retrieve public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(cleanBucket)
      .getPublicUrl(data.path);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return { success: false, error: 'Could not retrieve public URL for uploaded photo.' };
    }

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network failure when connecting to Supabase Storage.';
    console.error('[Supabase Upload Exception]', err);
    return { success: false, error: errorMsg };
  }
}
