import { useState } from "react";
import Image from "next/image";

import { YouTubeSearch } from "./YouTubeSearch";
import { api } from "~/utils/api";
import { useDownloads } from "~/contexts/DownloadContext";

interface Track {
  id: string;
  name: string;
  artists: string[];
  album: {
    name: string;
    image?: string;
  };
  duration_ms: number;
  explicit?: boolean;
  added_at?: string;
  spotify_url?: string;
}

interface TrackMatcherProps {
  tracks: Track[];
  title?: string;
  isLoading?: boolean;
}

export function TrackMatcher({ tracks, title, isLoading }: TrackMatcherProps) {
  const [selectedTracks, setSelectedTracks] = useState<Record<string, string>>({});
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const { addJobs } = useDownloads();

  // Download mutation
  const downloadMutation = api.youtube.downloadTracks.useMutation({
    onSuccess: (data) => {
      console.log('🎉 Download mutation success:', data);
      // Add jobs to the download context for progress tracking
      const validJobs = data.jobs.filter(job => job.jobId).map(job => ({
        jobId: job.jobId!,
        videoId: job.videoId,
        trackName: job.trackName,
        artistName: job.artistName,
      }));
      addJobs(validJobs);
    },
    onError: (error) => {
      console.error('❌ Download mutation error:', error);
      alert(`Download failed: ${error.message}`);
    },
  });

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTrackSelect = (trackId: string) => {
    setCurrentTrackId(trackId);
  };

  const handleYouTubeSelect = (trackId: string, videoId: string) => {
    setSelectedTracks(prev => {
      const currentSelection = prev[trackId];
      if (currentSelection === videoId) {
        // If clicking the same video, deselect it
        const newSelection = { ...prev };
        delete newSelection[trackId];
        return newSelection;
      } else {
        // Select the new video
        return {
          ...prev,
          [trackId]: videoId
        };
      }
    });
  };

  const handleDownload = () => {
    console.log('🎵 handleDownload called');
    const tracksToDownload = Object.entries(selectedTracks)
      .map(([trackId, videoId]) => {
        const track = tracks.find(t => t.id === trackId);
        if (!track) return null;

        return {
          videoId,
          trackName: track.name,
          artistName: track.artists[0] ?? 'Unknown Artist',
          allArtists: track.artists, // Pass all artists from Spotify
        };
      })
      .filter((track): track is NonNullable<typeof track> => track !== null);

    console.log('📋 Tracks to download:', tracksToDownload);

    if (tracksToDownload.length === 0) {
      alert('No tracks selected for download');
      return;
    }

    if (tracksToDownload.length > 50) {
      alert('Cannot download more than 50 tracks at once');
      return;
    }

    console.log('🚀 Calling download mutation...');
    downloadMutation.mutate({ tracks: tracksToDownload });
  };

  const currentTrack = tracks.find(track => track.id === currentTrackId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">{title ?? 'Tracks'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg animate-pulse">
                  <div className="w-16 h-16 bg-slate-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{title ?? 'Tracks'}</h2>
        <div className="text-sm text-slate-600">
          {Object.keys(selectedTracks).length} of {tracks.length} tracks matched
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spotify Tracks List */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-slate-900 mb-3">Spotify Tracks</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`flex items-center space-x-3 p-3 bg-white rounded-lg border cursor-pointer transition-colors ${
                  currentTrackId === track.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                } ${selectedTracks[track.id] ? 'ring-2 ring-green-200' : ''}`}
                onClick={() => handleTrackSelect(track.id)}
              >
                {track.album.image && (
                  <Image
                    src={track.album.image}
                    alt={track.album.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-slate-900 truncate">
                      {track.name}
                    </h4>
                    {track.explicit && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        E
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 truncate">
                    {track.artists.join(', ')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDuration(track.duration_ms)}
                  </p>
                </div>
                {selectedTracks[track.id] && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* YouTube Search Panel */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-slate-900 mb-3">YouTube Matches</h3>
          {currentTrack ? (
            <YouTubeSearch
              track={currentTrack}
              selectedVideoId={selectedTracks[currentTrack.id]}
              onSelect={(videoId) => handleYouTubeSelect(currentTrack.id, videoId)}
            />
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <p className="text-slate-500">Select a track to search for YouTube matches</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {Object.keys(selectedTracks).length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600">
            {Object.keys(selectedTracks).length} tracks selected for download
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedTracks({})}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Clear All
            </button>
            <button
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadMutation.isPending ? 'Starting Download...' : 'Download Selected'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}