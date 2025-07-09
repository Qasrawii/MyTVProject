export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  hero?: string;
  description: string;
  duration: string;
  url: string;
  hlsUrl: string;
  category: string;
  starring?: string;

}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error?: string;
}

export interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
  onError: (error: string) => void;
}

export interface VideoListItemProps {
  video: Video;
  onSelect: (video: Video) => void;
  isSelected: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (videoId: string) => void;
}
