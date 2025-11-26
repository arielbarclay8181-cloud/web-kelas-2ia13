import { X, Download, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FilePreviewModalProps {
  file: {
    id: string;
    name: string;
    type: string;
    path: string;
  };
  fileUrl: string;
  onClose: () => void;
  onDownload: () => void;
}

export function FilePreviewModal({ file, fileUrl, onClose, onDownload }: FilePreviewModalProps) {
  const [loading, setLoading] = useState(true);

  const canPreview = () => {
    const previewableTypes = [
      'application/pdf',
      'image/',
      'text/',
      'video/',
    ];
    return previewableTypes.some(type => file.type.includes(type));
  };

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={fileUrl}
          alt={file.name}
          className="max-w-full max-h-full object-contain rounded-lg"
          onLoad={() => setLoading(false)}
        />
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full rounded-lg"
          onLoad={() => setLoading(false)}
          title={file.name}
        />
      );
    }

    if (file.type.startsWith('video/')) {
      return (
        <video
          src={fileUrl}
          controls
          className="max-w-full max-h-full rounded-lg"
          onLoadedData={() => setLoading(false)}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (file.type.startsWith('text/')) {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full bg-white rounded-lg"
          onLoad={() => setLoading(false)}
          title={file.name}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Eye className="w-16 h-16 text-purple-400 mb-4" />
        <p className="text-purple-300 text-lg mb-2">Preview tidak tersedia</p>
        <p className="text-purple-400/60 text-sm mb-6">
          File ini tidak dapat di-preview secara langsung.
        </p>
        <button
          onClick={onDownload}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all hover:scale-105 flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download File
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl h-[90vh] bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-xl border-b border-purple-500/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <h3 className="text-white font-bold truncate">{file.name}</h3>
              <p className="text-purple-400/60 text-sm">{file.type || 'Unknown type'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onDownload}
                className="p-3 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-3 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="w-full h-full pt-20 p-4">
          {loading && canPreview() && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <p className="mt-4 text-purple-300">Loading preview...</p>
              </div>
            </div>
          )}
          <div className="w-full h-full flex items-center justify-center">
            {renderPreview()}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
