function getYouTubeThumbnailURL(url: string): string {
  // Use a regular expression to find the video ID in the URL
  const videoIdMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
  );

  if (!videoIdMatch) {
    return '/placeholder.svg';
  }
  const videoId = videoIdMatch[1];

  // Use hqdefault.jpg as it's more reliable than maxresdefault.jpg
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Function to get YouTube thumbnail with fallback
export function getYouTubeThumbnailWithFallback(url: string): {
  src: string;
  fallbackSrc: string;
} {
  const videoIdMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
  );

  if (!videoIdMatch) {
    return {
      src: '/placeholder.svg',
      fallbackSrc: '/placeholder.svg',
    };
  }

  const videoId = videoIdMatch[1];

  // Use hqdefault.jpg as primary (more reliable) and mqdefault.jpg as fallback
  return {
    src: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    fallbackSrc: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  };
}

export default getYouTubeThumbnailURL;
