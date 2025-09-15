import Image from "next/image";

import { api } from "~/utils/api";

interface YouTubeSearchProps {
  track: {
    id: string;
    name: string;
    artists: string[];
    album: {
      name: string;
      image?: string;
    };
    duration_ms: number;
  };
  selectedVideoId?: string;
  onSelect: (videoId: string) => void;
}

export function YouTubeSearch({ track, selectedVideoId, onSelect }: YouTubeSearchProps) {
  const { data: searchResults, isLoading } = api.youtube.searchYouTube.useQuery(
    {
      trackName: track.name,
      artistName: track.artists[0] ?? '',
      albumName: track.album.name,
      durationMs: track.duration_ms,
    },
    {
      enabled: true, // Always search when component mounts with a track
    }
  );

  const formatDuration = (duration: string) => {
    // Parse YouTube duration format (PT4M13S) to readable format
    const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(duration);
    if (!match) return '0:00';

    const hours = parseInt(match[1] ?? '0');
    const minutes = parseInt(match[2] ?? '0');
    const seconds = parseInt(match[3] ?? '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">YouTube Match</h3>
      </div>

      {searchResults?.matches && searchResults.matches.length > 0 ? (
        <div className="space-y-3">
          {searchResults.matches.map((match: { videoId: string; title: string; channel: string; duration: string; thumbnail: string; confidence: number; explicit: boolean }) => (
            <div
              key={match.videoId}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedVideoId === match.videoId
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => onSelect(match.videoId)}
            >
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={match.thumbnail}
                  alt={match.title}
                  fill
                  className="object-cover rounded"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-slate-900 truncate">
                    {match.title}
                  </h4>
                  {match.explicit && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      E
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 truncate">
                  {match.channel}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-slate-500">
                    {formatDuration(match.duration)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(match.confidence)}`}>
                    {Math.round(match.confidence)}% match
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.youtube.com/watch?v=${match.videoId}`, '_blank');
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                  title="Preview on YouTube"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>

                {selectedVideoId === match.videoId && (
                  <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <span>Searching YouTube...</span>
            </div>
          ) : (
            <p>No YouTube matches found for this track</p>
          )}
        </div>
      )}
    </div>
  );
}