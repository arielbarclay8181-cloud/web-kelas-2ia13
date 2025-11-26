import { useState, useEffect } from 'react';
import { Bell, Plus, X, Trash2, Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAdmin } from '../context/AdminContext'; 

interface Announcement {
  id: string;
  message: string;
  date: string;
}

export function AnnouncementPanel() {
  const { isAdmin } = useAdmin(); 
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);


  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/announcements`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/announcements`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: newMessage }),
        }
      );
      const data = await response.json();
      setAnnouncements([data.announcement, ...announcements]);
      setNewMessage('');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/announcements/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      setAnnouncements(announcements.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  return (
    <div className="relative bg-gradient-to-br from-orange-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl border border-orange-500/20 p-6 shadow-2xl overflow-hidden">
      {/* Animated Background Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 flex items-center gap-2">
                Info & Pengumuman
                <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
              </h2>
              <p className="text-orange-300/60 text-sm">Update terbaru untuk kelas</p>
            </div>
          </div>
          
          {/* Kondisi: Hanya tampilkan tombol Tambah jika isAdmin true */}
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="group relative p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl shadow-lg shadow-orange-500/50 hover:shadow-orange-500/80 transition-all duration-300 hover:scale-110"
              title="Tambah Pengumuman"
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                {showForm ? <X className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
              </div>
            </button>
          )}
        </div>

        {showForm && isAdmin && ( 
          <form onSubmit={handleAddAnnouncement} className="mb-6 bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-white placeholder-orange-400/40 transition-all"
              rows={3}
              placeholder="Tulis pengumuman baru..."
              required
            />
            <div className="flex gap-2 justify-end mt-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNewMessage('');
                }}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-orange-300 transition-all font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-lg shadow-orange-500/50 hover:shadow-orange-500/80 transition-all hover:scale-105"
              >
                Posting
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : announcements.length === 0 ? (
          <p className="text-orange-300/50 text-center py-8">Belum ada pengumuman.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="group relative bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="text-white">{announcement.message}</p>
                    <p className="text-xs text-orange-400/60 mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse"></span>
                      {formatDate(announcement.date)}
                    </p>
                  </div>
                  {/* Kondisi: Hanya tampilkan tombol Hapus jika isAdmin true */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="p-2 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 146, 60, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 146, 60, 0.5);
        }
      `}</style>
    </div>
  );
}