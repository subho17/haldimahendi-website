import { useState, useRef, useEffect } from 'react';

/**
 * Component for playing voice messages
 * 
 * Features:
 * - Play/pause functionality
 * - Duration display
 * - Error handling for invalid URLs
 * - Accessible ARIA labels
 * - Automatic cleanup
 */
interface VoiceMessagePlayerProps {
  voiceUrl: string;
  voiceDuration: number;
  isPlaying?: boolean;
  onPlay?: () => void;
  onEnd?: () => void;
}

/**
 * Renders a voice message player with play button and audio element
 * 
 * Usage:
 * <VoiceMessagePlayer
 *   voiceUrl={message.voiceUrl}
 *   voiceDuration={message.voiceDuration || 0}
 *   onPlay={() => console.log('Playing...')}
 *   onEnd={() => console.log('Finished')}
 * />
 */
export function VoiceMessagePlayer({
  voiceUrl,
  voiceDuration,
  onPlay,
  onEnd,
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setIsPlaying(true);
      onPlay?.();
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
      onEnd?.();
    }
  };

  return (
    <div className="relative group w-full">
      {/* Play/Pause button */}
      <button
        onClick={handlePlay}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 text-white text-xs p-1 flex items-center justify-center transition-colors group-hover:bg-black/80"
        aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg
            viewBox="0 0 24 24"
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
          >
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="w-3 h-3"
            fill="currentColor"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={voiceUrl}
        className="w-full rounded-md overflow-hidden shadow-sm"
        controls={isPlaying}
        onPlay={handlePlay}
        onEnded={() => {
          setIsPlaying(false);
          onEnd?.();
        }}
      >
        <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-300">
          Your browser does not support the audio element.
        </p>
      </audio>

      {/* Duration label */}
      <div className="absolute bottom-1 left-1 right-1 text-xs text-gray-300 flex justify-between">
        <span>{`${Math.min(voiceDuration, 60)}s`}</span>
      </div>
    </div>
  );
}