import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

/**
 * Hook for recording voice messages and uploading to Supabase Storage
 * 
 * Features:
 * - MediaRecorder with OGG format
 * - Duration tracking
 * - Automatic upload to Supabase
 * - Error handling
 * - Cleanup on unmount
 * 
 * Usage:
 * const { audioUrl, duration, isRecording, startRecording, stopRecording } = useVoiceMessage({
 *   conversationId: 'conv_123',
 *   senderId: 'user_456',
 *   recipientId: 'user_789',
 *   onMessageSend: (message) => { console.log(message); }
 * });
 */
export function useVoiceMessage({
  conversationId,
  senderId,
  onMessageSend,
  maxDuration = 60, // seconds
  maxFileSize = 5 * 1024 * 1024, // 5MB
}: {
  conversationId: string;
  senderId: string;
  recipientId: string;
  onMessageSend: (message: {
    conversationId: string;
    voiceUrl: string;
    voiceDuration: number;
  }) => void;
  maxDuration?: number;
  maxFileSize?: number;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | number | null>(null);

  // Start recording
  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined' || !window.MediaRecorder) {
      setError('MediaRecorder not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/ogg',
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        if (mediaRecorderRef.current?.state === 'inactive' && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg' });
        
        if (audioBlob.size > maxFileSize) {
          setError(`File too large: ${(audioBlob.size / 1024 / 1024).toFixed(1)}MB (max: 5MB)`);
          audioChunksRef.current = [];
          setIsRecording(false);
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.start();
          }
          return;
        }

        setError(null);
        setDuration(0);
        setAudioUrl(null);
        
        const fileName = `audio/${senderId}/${conversationId}/${Date.now()}.ogg`;
        setIsRecording(true);

        const supabase = getSupabaseClient();
        if (!supabase) {
          setError('Storage service unavailable');
          setIsRecording(false);
          return;
        }

        const { error: uploadError } = await supabase.storage
          .from('chat-audio')
          .upload(fileName, audioBlob, { contentType: 'audio/ogg' });

        if (uploadError) {
          setError(`Upload failed: ${uploadError.message}`);
          audioChunksRef.current = [];
          setIsRecording(false);
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.start();
          }
          return;
        }

        const { data: urlData } = supabase.storage
          .from('chat-audio')
          .getPublicUrl(fileName);

        const seconds = Math.round(
          audioChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0) / 1000 / 8 / 128
        );

        onMessageSend({
          conversationId,
          voiceUrl: urlData.publicUrl,
          voiceDuration: seconds > 0 ? seconds : 1,
        });

        audioChunksRef.current = [];
        setIsRecording(false);
        setAudioUrl(urlData.publicUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      timeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      }, maxDuration * 1000);

    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Could not access microphone. Please allow permission.');
    }
  }, [conversationId, senderId, maxDuration, maxFileSize, onMessageSend]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setDuration(0);
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    duration,
    audioUrl,
    error,
    startRecording,
    stopRecording,
  };
}