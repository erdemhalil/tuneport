import { useState, useEffect } from 'react';
import { useDownloads } from '~/contexts/DownloadContext';

export function DownloadProgressWidget() {
  const { jobs, removeJob, clearCompleted } = useDownloads();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloadedJobs, setDownloadedJobs] = useState<Set<string>>(new Set());

  // Auto-download completed jobs
  useEffect(() => {
    jobs.forEach(job => {
      if (job.status === 'completed' && job.result?.downloadId && !downloadedJobs.has(job.jobId)) {
        console.log(`Auto-downloading completed job: ${job.jobId} - ${job.trackName}`);
        // Trigger download
        const downloadUrl = `/api/download/${job.result.downloadId}`;
        console.log(`Download URL: ${downloadUrl}`);

        // Try multiple approaches for browser compatibility
        try {
          // Method 1: Create and click a link with proper filename
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `${job.artistName} - ${job.trackName}.mp3`; // Suggest filename
          link.style.display = 'none';

          // Add to DOM temporarily
          document.body.appendChild(link);

          console.log('Clicking download link...');
          link.click();

          // Remove from DOM
          document.body.removeChild(link);
          console.log('Download link clicked and removed');

          // Mark as downloaded to avoid duplicate downloads
          setDownloadedJobs(prev => new Set(prev).add(job.jobId));
        } catch (error) {
          console.error('Download failed:', error);
          // Fallback: open in new tab (less ideal but works)
          console.log('Falling back to opening in new tab');
          window.open(downloadUrl, '_blank');
          setDownloadedJobs(prev => new Set(prev).add(job.jobId));
        }
      }
    });
  }, [jobs, downloadedJobs]);

  const triggerDownload = (downloadId: string, trackName?: string, artistName?: string) => {
    console.log(`Manual download triggered for: ${downloadId}`);
    const downloadUrl = `/api/download/${downloadId}`;
    console.log(`Manual download URL: ${downloadUrl}`);

    try {
      // Create and click a link with proper filename
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = trackName && artistName ? `${artistName} - ${trackName}.mp3` : ''; // Suggest filename
      link.className = 'hidden'; // Use Tailwind hidden class
      document.body.appendChild(link);
      console.log('Clicking manual download link...');
      link.click();
      document.body.removeChild(link);
      console.log('Manual download link clicked and removed');
    } catch (error) {
      console.error('Manual download failed:', error);
      // Fallback: open in new tab
      console.log('Falling back to opening in new tab');
      window.open(downloadUrl, '_blank');
    }
  };

  if (jobs.length === 0) {
    return null;
  }

  const activeJobs = jobs.filter(job => !['completed', 'failed'].includes(job.status));
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const failedJobs = jobs.filter(job => job.status === 'failed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'active':
      case 'waiting':
        return 'text-blue-600';
      default:
        return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'active':
        return (
          <svg className="w-4 h-4 text-blue-600 animate-spin" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span>Downloads ({jobs.length})</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-medium text-slate-900">Downloads</h3>
          <div className="flex items-center space-x-2">
            {completedJobs.length > 0 && (
              <button
                onClick={clearCompleted}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Clear completed
              </button>
            )}
            <button
              onClick={() => setIsMinimized(true)}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className={`max-h-96 overflow-y-auto ${isExpanded ? 'max-h-none' : ''}`}>
          {jobs.map((job) => (
            <div key={job.jobId} className="border-b border-slate-100 last:border-b-0">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(job.status)}
                      <h4 className="text-sm font-medium text-slate-900 truncate">
                        {job.trackName}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 truncate">
                      {job.artistName}
                    </p>
                  </div>
                  <button
                    onClick={() => removeJob(job.jobId)}
                    className="text-slate-400 hover:text-slate-600 ml-2 flex-shrink-0"
                    title="Remove download"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Progress Bar */}
                {job.status === 'active' && (
                  <div className="mb-2">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{Math.round(job.progress)}%</span>
                      <span>{job.status}</span>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${getStatusColor(job.status)}`}>
                    {job.status === 'completed' && job.result ? formatFileSize(job.result.fileSize) : job.status}
                  </span>
                  {job.status === 'completed' && job.result?.downloadId && (
                    <button
                      onClick={() => triggerDownload(job.result!.downloadId, job.trackName, job.artistName)}
                      className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      title="Download file"
                    >
                      Download
                    </button>
                  )}
                  {job.status === 'failed' && (
                    <span className="text-red-600 truncate ml-2">
                      {job.failedReason ?? job.error ?? 'Failed'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with summary */}
        {(activeJobs.length > 0 || completedJobs.length > 0 || failedJobs.length > 0) && (
          <div className="bg-slate-50 px-4 py-2 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>
                {activeJobs.length > 0 && `${activeJobs.length} active`}
                {activeJobs.length > 0 && (completedJobs.length > 0 || failedJobs.length > 0) && ', '}
                {completedJobs.length > 0 && `${completedJobs.length} completed`}
                {(activeJobs.length > 0 || completedJobs.length > 0) && failedJobs.length > 0 && ', '}
                {failedJobs.length > 0 && `${failedJobs.length} failed`}
              </span>
              {jobs.length > 3 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {isExpanded ? 'Show less' : 'Show all'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}