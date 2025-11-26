import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Student {
  id: string;
  npm: string;
  name: string;
  phone: string;
}

export function StudentsPage() {
  const { isAdmin } = useAdmin();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ npm: '', name: '', phone: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/students`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStudent) {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/students/${editingStudent.id}`,
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
        setStudents(students.map(s => s.id === editingStudent.id ? data.student : s));
      } else {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/students`,
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
        setStudents([...students, data.student]);
      }
      
      setFormData({ npm: '', name: '', phone: '' });
      setShowForm(false);
      setEditingStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mahasiswa ini?')) return;
    
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/students/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ npm: student.npm, name: student.name, phone: student.phone });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                Data Mahasiswa 2IA13
              </h2>
              <p className="text-green-300/60 text-sm">{students.length} mahasiswa terdaftar</p>
            </div>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => {
                setEditingStudent(null);
                setFormData({ npm: '', name: '', phone: '' });
                setShowForm(!showForm);
              }}
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/50 hover:shadow-green-500/80 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Tambah Mahasiswa</span>
              </div>
            </button>
          )}
        </div>

        {showForm && isAdmin && (
          <form onSubmit={handleSubmit} className="mb-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm rounded-xl p-6 border-2 border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                {editingStudent ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingStudent(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-green-300" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-green-300 mb-2">NPM</label>
                <input
                  type="text"
                  value={formData.npm}
                  onChange={(e) => setFormData({ ...formData, npm: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-green-500/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-green-400/40 transition-all"
                  placeholder="e.g., 50422xxx"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-300 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-green-500/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-green-400/40 transition-all"
                  placeholder="Nama mahasiswa"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-300 mb-2">Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-green-500/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-green-400/40 transition-all"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingStudent(null);
                }}
                className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-green-300 transition-all font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/50 hover:shadow-green-500/80 transition-all hover:scale-105"
              >
                {editingStudent ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        )}

        {students.length === 0 ? (
          <div className="text-center py-12 text-green-300/50">
            <Users className="w-16 h-16 mx-auto mb-4 text-green-400/30" />
            <p>Belum ada data mahasiswa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full align-middle px-6">
              <div className="overflow-hidden rounded-xl border border-green-500/20">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-4 text-left font-bold text-green-300">No</th>
                      <th className="px-4 py-4 text-left font-bold text-green-300">NPM</th>
                      <th className="px-4 py-4 text-left font-bold text-green-300">Nama</th>
                      <th className="px-4 py-4 text-left font-bold text-green-300">Telepon</th>
                      {isAdmin && (
                        <th className="px-4 py-4 text-right font-bold text-green-300">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-500/10">
                    {students.map((student, index) => (
                      <tr key={student.id} className="group hover:bg-green-500/5 transition-all duration-200">
                        <td className="px-4 py-4 text-green-300/80">{index + 1}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                            {student.npm}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-white font-semibold">{student.name}</td>
                        <td className="px-4 py-4 text-green-300/80">{student.phone}</td>
                        {isAdmin && (
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(student)}
                                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(student.id)}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
