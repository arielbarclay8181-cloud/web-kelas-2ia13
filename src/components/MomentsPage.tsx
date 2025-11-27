import { useState, useEffect } from 'react';
import { Heart, Trash2, Camera, ImageIcon, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { MomentModal } from './MomentModal'; 

interface Moment {
  id: string;
  text: string;
  author: string;
  imagePath: string | null;
  createdAt: string;
}

export function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ text: '', author: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null); 
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMoments();
  }, []);

  const fetchMoments = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/moments`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const data = await response.json();
      setMoments(data.moments || []);
    } catch (error) {
      console.error('Error fetching moments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
                } else {
                  resolve(file); 
                }
              },
              file.type,
              quality
            );
          } else {
            resolve(file); 
          }
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedFile = await compressImage(file, 1200, 1200, 0.7); 
      setSelectedImage(compressedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('text', formData.text);
      formDataToSend.append('author', formData.author || 'Anonymous');
      
      if (selectedImage) {
        const ext = selectedImage.name.split('.').pop();
        const safeFileName = `moment-${Date.now()}.${ext}`; 
        const safeFile = new File([selectedImage], safeFileName, { 
          type: selectedImage.type, 
          lastModified: Date.now() 
        });

        formDataToSend.append('image', safeFile); 
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/moments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formDataToSend,
        }
      );
      const data = await response.json();
      setMoments([data.moment, ...moments]);
      
      setFormData({ text: '', author: '' });
      setSelectedImage(null);
      setImagePreview(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating moment:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus moment ini?')) return;
    
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/moments/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      setMoments(moments.filter(m => m.id !== id));
      setImageUrls(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error('Error deleting moment:', error);
    }
  };

  useEffect(() => {
    const loadPublicImageUrls = () => {
      const urls: Record<string, string> = {};
      const bucketName = 'make-d50695a3-materials'; 
      
      for (const moment of moments) {
        if (moment.imagePath && !imageUrls[moment.id]) {
          const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}/${moment.imagePath}`;
          urls[moment.id] = publicUrl;
        }
      }
      setImageUrls(prev => ({ ...prev, ...urls }));
    };
    
    if (moments.length > 0) {
      loadPublicImageUrls();
    }
  }, [moments, projectId, imageUrls]); 

  const handleViewMoment = (moment: Moment) => {
    setSelectedMoment(moment);
  };

  const handleCloseModal = () => {
    setSelectedMoment(null);
  };
  
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-pink-500/20 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                Moments Kelas 2IA13
              </h2>
              <p className="text-pink-300/60 text-sm">Kenangan dan cerita bersama</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80 transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              <Camera className="w-5 h-5" />
              <span>Tambah Moment</span>
            </div>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 bg-gradient-to-br from-pink-900/20 to-rose-900/20 backdrop-blur-sm rounded-xl p-6 border-2 border-pink-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                Bagikan Moment Baru
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ text: '', author: '' });
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-pink-300" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-pink-300 mb-2">Nama (opsional)</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-pink-400/40 transition-all"
                  placeholder="Nama kamu (atau biarkan kosong untuk Anonymous)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-pink-300 mb-2">Caption / Cerita</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-pink-400/40 transition-all resize-none"
                  rows={4}
                  placeholder="Tulis cerita atau kenangan kamu..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-pink-300 mb-2">Foto (opsional)</label>
                <div className="flex items-center gap-4">
                  <label className="group/upload flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-pink-500/30 rounded-xl cursor-pointer hover:bg-pink-500/10 hover:border-pink-500/50 transition-all duration-300 flex-1">
                    <ImageIcon className="w-5 h-5 text-pink-400" />
                    <span className="text-pink-300 font-semibold">
                      {selectedImage ? selectedImage.name : 'Pilih Foto'}
                    </span>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                  
                  {imagePreview && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-pink-500/30">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ text: '', author: '' });
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-pink-300 transition-all font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80 transition-all hover:scale-105 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Posting'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Moments Grid */}
      {moments.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-pink-500/20 p-12 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-pink-400/30" />
          <p className="text-pink-300/50 text-lg">Belum ada moments.</p>
          <p className="text-pink-400/40 text-sm mt-2">Mulai bagikan kenangan kelas kamu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moments.map((moment) => (
            <div
              key={moment.id}
              onClick={moment.imagePath ? () => handleViewMoment(moment) : undefined} 
              className={`group bg-black/40 backdrop-blur-xl rounded-2xl border border-pink-500/20 overflow-hidden hover:border-pink-500/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20 ${moment.imagePath ? 'cursor-pointer' : ''}`}
            >
              {/* Cek apakah URL gambar sudah ada di state */}
              {moment.imagePath && imageUrls[moment.id] && (
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={imageUrls[moment.id]}
                    alt="Moment"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
              )}
              
              <div className="p-6">
                <p className="text-white mb-4 whitespace-pre-wrap">{moment.text}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <p className="text-pink-400 font-semibold text-sm">{moment.author || 'Anonymous'}</p>
                    <p className="text-pink-300/40 text-xs">
                      {new Date(moment.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleDelete(moment.id);
                    }}
                    className="p-2 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal Centered View */}
      {selectedMoment && (
        <MomentModal
          moment={selectedMoment}
          imageUrl={imageUrls[selectedMoment.id] || null}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}