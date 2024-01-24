function getYouTubeThumbnailURL(url: string): string {
  // Use a regular expression to find the video ID in the URL
  const videoIdMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
  );

  if (!videoIdMatch) {
    return '/placeholder.svg';
    // throw new Error('Invalid YouTube URL');
  }
  const videoId = videoIdMatch[1];

  // Construct the thumbnail URL using the video ID
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export default getYouTubeThumbnailURL;
