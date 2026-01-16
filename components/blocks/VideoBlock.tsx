interface VideoBlockProps {
  content: string | null;
  metadata?: {
    provider?: string;
    videoId?: string;
    autoplay?: boolean;
    loop?: boolean;
  };
}

export default function VideoBlock({ content, metadata }: VideoBlockProps) {
  const provider = metadata?.provider || 'youtube';
  const videoId = metadata?.videoId || content;

  if (!videoId) {
    return null;
  }

  if (provider === 'youtube') {
    return (
      <div className="my-8 aspect-video overflow-hidden rounded-lg shadow-md">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}${metadata?.autoplay ? '?autoplay=1' : ''}${metadata?.loop ? '&loop=1' : ''}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if (provider === 'vimeo') {
    return (
      <div className="my-8 aspect-video overflow-hidden rounded-lg shadow-md">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}${metadata?.autoplay ? '?autoplay=1' : ''}${metadata?.loop ? '&loop=1' : ''}`}
          title="Vimeo video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // Self-hosted video
  return (
    <div className="my-8 overflow-hidden rounded-lg shadow-md">
      <video
        src={videoId}
        controls
        autoPlay={metadata?.autoplay}
        loop={metadata?.loop}
        className="w-full"
      />
    </div>
  );
}
