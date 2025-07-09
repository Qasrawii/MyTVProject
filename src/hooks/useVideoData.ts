import { useState, useEffect } from 'react';
import { Video } from '@/src/types/video';
import videosData from '@/src/data/videos.json';

export function useVideoData() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
    loadFavorites();
  }, []);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate network delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validate video data structure
      if (!Array.isArray(videosData)) {
        throw new Error('Invalid video data format');
      }

      const validatedVideos = videosData.filter((video: any) => {
        const isValid = video.id && video.title && video.thumbnail && video.url && video.hlsUrl;
        if (!isValid) {
          console.warn('Invalid video data:', video);
        }
        return isValid;
      });

      if (validatedVideos.length === 0) {
        throw new Error('No valid videos found');
      }

      console.log(`Loaded ${validatedVideos.length} valid videos`);
      setVideos(validatedVideos as Video[]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load videos. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Error loading videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = () => {
    // In a real app, this would load from AsyncStorage or a backend
    // For now, we'll use a simple Set
    setFavorites(new Set());
  };

  const toggleFavorite = (videoId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(videoId)) {
        newFavorites.delete(videoId);
      } else {
        newFavorites.add(videoId);
      }
      // In a real app, save to AsyncStorage here
      return newFavorites;
    });
  };

  const isFavorite = (videoId: string) => favorites.has(videoId);

  const getFavoriteVideos = () => {
    return videos.filter(video => favorites.has(video.id));
  };

  const retryLoading = () => {
    loadVideos();
  };

  return {
    videos,
    favorites,
    isLoading,
    error,
    toggleFavorite,
    isFavorite,
    getFavoriteVideos,
    retryLoading,
  };
}
