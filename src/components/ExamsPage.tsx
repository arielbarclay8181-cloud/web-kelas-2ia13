import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Exam {
  id: string;
  type: string; 
  day: string;
  date: string;
  subject: string;
  time: string;
  room: string;
}

const examTypes = ['UTS', 'UU', 'UAS'];
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function ExamsPage() {
  const { isAdmin } = useAdmin();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    type: 'UTS',
    day: '',
    date: '',
    subject: '',
    time: '',
    room: '',
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/exams`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const data = await response.json();
      setExams(data.exams || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingExam) {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/exams/${editingExam.id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          }
        );
        const data = await response.json();
        setExams(exams.map(e => e.id === editingExam.id ? data.exam : e));
      } else {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/exams`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          }
        );
        const data = await response.json();
        setExams([...exams, data.exam]);
      }
      
      setFormData({ type: 'UTS', day: '', date: '', subject: '', time: '', room: '' });
      setShowForm(false);
      setEditingExam(null);
    } catch (error) {
      console.error('Error saving exam:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ujian ini?')) return;
    
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/exams/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      setExams(exams.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData(exam);
    setShowForm(true);
  };

  const groupedExams = examTypes.map(type => ({
    type,
    exams: exams.filter(e => e.type === type).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-yellow-500/20 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Jadwal Ujian
              </h2>
              <p className="text-yellow-300/60 text-sm">UTS • UU • UAS</p>
            </div>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => {
                setEditingExam(null);
                setFormData({ type: 'UTS', day: '', date: '', subject: '', time: '', room: '' });
                setShowForm(!showForm);
              }}
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/80 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Tambah Jadwal Ujian</span>
              </div>
            </button>
          )}
        </div>

        {showForm && isAdmin && (
          <form onSubmit={handleSubmit} className="mb-6 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                {editingExam ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian Baru'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingExam(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-yellow-300" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-yellow-300 mb-2">Jenis Ujian</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-yellow-500/30 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white transition-all"
                  required
                >
                  {examTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-900">{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-yellow-300 mb-2">Hari</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-yellow-500/30 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white transition-all"
                  required
                >
                  <option value="" className="bg-gray-900">Pilih Hari</option>
                  {days.map(day => (
                    <option key={day} value={day} className="bg-gray-900">{day}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-yellow-300 mb-2">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-yellow-500/30 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-yellow-300 mb-2">Mata Kuliah</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-yellow-500/30 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-yellow-400/40 transition-all"
                  placeholder="e.g., Pemrograman Web"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-yellow-300 mb-2">Waktu</label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-yellow-500/30 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-yellow-400/40 transition-all"
                  placeholder="e.g., 08:00 - 10:00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-yellow-300 mb-2">Ruang</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-yellow-500/30 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-yellow-400/40 transition-all"
                  placeholder=" D-321 "
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingExam(null);
                }}
                className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-yellow-300 transition-all font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/80 transition-all hover:scale-105"
              >
                {editingExam ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Grouped Exams by Type */}
      <div className="space-y-6">
        {groupedExams.map(({ type, exams: typeExams }) => (
          <div key={type} className="bg-black/40 backdrop-blur-xl rounded-2xl border border-yellow-500/20 overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 border-b border-yellow-500/20">
              <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                {type} - {type === 'UTS' ? 'Ujian Tengah Semester' : type === 'UU' ? 'Ujian Utama' : 'Ujian Akhir Semester'}
              </h3>
              <p className="text-yellow-300/60 text-sm mt-1">{typeExams.length} jadwal ujian</p>
            </div>
            
            {typeExams.length === 0 ? (
              <div className="p-12 text-center text-yellow-300/50">
                Belum ada jadwal ujian untuk {type}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-yellow-300">Hari</th>
                      <th className="px-4 py-3 text-left font-bold text-yellow-300">Tanggal</th>
                      <th className="px-4 py-3 text-left font-bold text-yellow-300">Mata Kuliah</th>
                      <th className="px-4 py-3 text-left font-bold text-yellow-300">Waktu</th>
                      <th className="px-4 py-3 text-left font-bold text-yellow-300">Ruang</th>
                      {isAdmin && (
                        <th className="px-4 py-3 text-right font-bold text-yellow-300">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-yellow-500/10">
                    {typeExams.map((exam) => (
                      <tr key={exam.id} className="group hover:bg-yellow-500/5 transition-all duration-200">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            {exam.day}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-yellow-300/80">
                          {new Date(exam.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-white font-semibold">{exam.subject}</td>
                        <td className="px-4 py-3 text-yellow-300/80">{exam.time}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            {exam.room}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(exam)}
                                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(exam.id)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
