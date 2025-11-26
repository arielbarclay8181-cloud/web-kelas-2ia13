import { X, Heart } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Moment {
  id: string;
  text: string;
  author: string;
  imagePath: string | null;
  createdAt: string;
}

interface MomentModalProps {
  moment: Moment;
  imageUrl: string | null;
  onClose: () => void;
}

export function MomentModal({ moment, imageUrl, onClose }: MomentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef} 
        className="relative w-full max-w-screen-md max-h-[90vh] bg-gradient-to-br from-pink-900/40 to-rose-900/40 rounded-2xl border border-pink-500/30 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header/Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-pink-500/20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            <h3 className="text-white font-bold">Detail Moment</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 text-pink-300 hover:bg-white/10 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Bisa di-scroll) */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          
          {/* KONTEN GAMBAR */}
          {imageUrl && (
            <div className="relative w-full rounded-xl overflow-hidden border border-pink-500/30 shadow-xl text-center flex justify-center items-center bg-black p-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <img
                src={imageUrl}
                alt="Moment Full View"
                className="max-w-full max-h-full h-auto object-contain block"
              />
            </div>
          )}
          
          {/* DETAIL MOMENT */}
          <div className="space-y-4">
            <div className="bg-black/30 p-4 rounded-xl border border-pink-500/20">
              <p className="text-pink-400 font-semibold text-sm mb-1">Dibuat Oleh:</p>
              <h4 className="text-white text-xl font-bold">{moment.author || 'Anonymous'}</h4>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-pink-500/20">
              <p className="text-pink-400 font-semibold text-sm mb-2">Cerita / Caption:</p>
              <p className="text-white whitespace-pre-wrap">{moment.text}</p>
            </div>
            
            <p className="text-pink-300/60 text-xs pt-2">
              Diposting pada: {formatDate(moment.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}