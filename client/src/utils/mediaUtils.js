/**
 * Helper function to convert a media URL path to a full URL
 * This ensures consistent handling of media URLs throughout the application
 * 
 * @param {string} mediaUrl - The media URL path (e.g., '/uploads/image.jpg')
 * @returns {string} - The full URL including the server base URL
 */
export const getFullMediaUrl = (mediaUrl) => {
  if (!mediaUrl) return '';
  
  // If the URL already includes http:// or https://, return it as is
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    return mediaUrl;
  }
  
  // Add the server base URL to the media path
  return `http://127.0.0.1:8000${mediaUrl}`;
};
