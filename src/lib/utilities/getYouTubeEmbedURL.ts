function getYouTubeEmbedUrl(youtubeUrl: string) {
  try {
    // Parse the YouTube video ID from the URL
    const videoIdMatch = youtubeUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?feature=player_embedded&v=|embed\/videoseries\?list=))(.*?)(?:\?|&|&list=|$)/
    );

    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];

      // Construct and return the embed URL
      return `https://www.youtube.com/embed/${videoId}`;
    } else {
      throw new Error('Invalid YouTube URL');
    }
  } catch (error) {
    console.error(error);
    return 'https://youtube.com';
  }
}

export default getYouTubeEmbedUrl;
