import { useState } from 'react';
import { Shield, LogOut, Lock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export function AdminPage() {
  const { isAdmin, login, logout } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const success = await login(username, password);
    
    if (!success) {
      setError('Username atau password salah!');
    }
    
    setLoading(false);
    setUsername('');
    setPassword('');
  };

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      await logout();
    }
  };

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-red-500/20 p-8 shadow-2xl text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative p-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-lg">
              <Shield className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-2">
            Mode Admin Aktif
          </h2>
          <p className="text-red-300/60 mb-8">
            Anda memiliki akses penuh untuk mengelola sistem
          </p>
          
          <div className="max-w-md mx-auto space-y-4 mb-8">
            <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <p className="text-white font-semibold mb-1">✓ Kelola Jadwal Kuliah & Ujian</p>
              <p className="text-red-300/60 text-sm">Tambah, edit, dan hapus jadwal</p>
            </div>
            
            <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <p className="text-white font-semibold mb-1">✓ Kelola Materi & Tugas</p>
              <p className="text-red-300/60 text-sm">Upload dan delete file materi kuliah</p>
            </div>
            
            <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <p className="text-white font-semibold mb-1">✓ Kelola Data Mahasiswa</p>
              <p className="text-red-300/60 text-sm">Tambah dan edit data mahasiswa kelas</p>
            </div>
            
            <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <p className="text-white font-semibold mb-1">✓ Kelola Kelompok</p>
              <p className="text-red-300/60 text-sm">Atur kelompok untuk setiap mata kuliah</p>
            </div>
            
            <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <p className="text-white font-semibold mb-1">✓ Posting Pengumuman</p>
              <p className="text-red-300/60 text-sm">Buat pengumuman untuk kelas</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow-lg shadow-red-500/50 hover:shadow-red-500/80 transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              <span>Logout dari Mode Admin</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-red-500/20 p-8 shadow-2xl max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative p-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-lg">
              <Lock className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-2">
            Admin Login
          </h2>
          <p className="text-red-300/60">
            Masuk sebagai admin untuk mengelola sistem
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-red-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-red-400/40 transition-all"
              placeholder="Masukkan username"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-red-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-red-400/40 transition-all"
              placeholder="Masukkan password"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full group relative px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow-lg shadow-red-500/50 hover:shadow-red-500/80 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Login sebagai Admin</span>
                </>
              )}
            </div>
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-red-400/40">
          <p>Hanya admin yang memiliki akses untuk login</p>
        </div>
      </div>
    </div>
  );
}
