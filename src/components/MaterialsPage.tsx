import { useState, useEffect } from 'react';
import { Plus, BookOpen, Sparkles } from 'lucide-react';
import { SemesterCard } from './SemesterCard';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAdmin } from '../context/AdminContext';

interface FileItem {
  id: string;
  name: string;
  type: string;
  path: string;
  uploadedAt: string;
}

interface Course {
  id: string;
  name: string;
  files: FileItem[];
}

interface Semester {
  id: string;
  name: string;
  number: number;
  courses: Course[];
}

export function MaterialsPage() {
  const { isAdmin } = useAdmin();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSemester, setShowAddSemester] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState('');
  const [newSemesterNumber, setNewSemesterNumber] = useState('');

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/semesters`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      const sortedSemesters = (data.semesters || []).sort(
        (a: Semester, b: Semester) => a.number - b.number
      );
      setSemesters(sortedSemesters);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemesterName.trim() || !newSemesterNumber) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/semesters`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newSemesterName,
            number: parseInt(newSemesterNumber),
          }),
        }
      );
      const data = await response.json();
      setSemesters([...semesters, data.semester].sort((a, b) => a.number - b.number));
      setNewSemesterName('');
      setNewSemesterNumber('');
      setShowAddSemester(false);
    } catch (error) {
      console.error('Error adding semester:', error);
    }
  };

  const handleAddCourse = async (semesterId: string, courseName: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/semesters/${semesterId}/courses`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: courseName }),
        }
      );
      const data = await response.json();
      
      setSemesters(
        semesters.map((sem) =>
          sem.id === semesterId
            ? { ...sem, courses: [...sem.courses, data.course] }
            : sem
        )
      );
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleFileUpload = async (
    semesterId: string,
    courseId: string,
    file: File
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/semesters/${semesterId}/courses/${courseId}/files`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();

      setSemesters(
        semesters.map((sem) =>
          sem.id === semesterId
            ? {
                ...sem,
                courses: sem.courses.map((course) =>
                  course.id === courseId
                    ? { ...course, files: [...course.files, data.file] }
                    : course
                ),
              }
            : sem
        )
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Gagal mengupload file. Silakan coba lagi.');
    }
  };

  const handleDeleteFile = async (
    semesterId: string,
    courseId: string,
    fileId: string
  ) => {
    if (!confirm('Apakah Anda yakin ingin menghapus file ini?')) return;

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/semesters/${semesterId}/courses/${courseId}/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      setSemesters(
        semesters.map((sem) =>
          sem.id === semesterId
            ? {
                ...sem,
                courses: sem.courses.map((course) =>
                  course.id === courseId
                    ? {
                        ...course,
                        files: course.files.filter((f) => f.id !== fileId),
                      }
                    : course
                ),
              }
            : sem
        )
      );
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-blue-300">Loading materi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2">
                Materi Kuliah
                <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              </h2>
              <p className="text-blue-300/60 text-sm">Koleksi materi per semester dan mata kuliah</p>
            </div>
          </div>

          {isAdmin && ( 
            <button
              onClick={() => setShowAddSemester(!showAddSemester)}
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg shadow-blue-500/50 hover:shadow-blue-500/80 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Tambah Semester</span>
              </div>
            </button>
          )}
        </div>

        {showAddSemester && isAdmin && (  
          <form
            onSubmit={handleAddSemester}
            className="mb-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl p-6 border-2 border-blue-500/30"
          >
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              Tambah Semester Baru
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-2">Nama Semester</label>
                <input
                  type="text"
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-blue-400/40 transition-all"
                  placeholder="e.g., Semester 1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-2">Nomor Semester</label>
                <input
                  type="number"
                  value={newSemesterNumber}
                  onChange={(e) => setNewSemesterNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-blue-400/40 transition-all"
                  placeholder="1"
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddSemester(false);
                  setNewSemesterName('');
                  setNewSemesterNumber('');
                }}
                className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-blue-300 transition-all font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg shadow-blue-500/50 hover:shadow-blue-500/80 transition-all hover:scale-105"
              >
                Simpan
              </button>
            </div>
          </form>
        )}
      </div>

      {semesters.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-blue-400" />
          </div>
          <p className="text-blue-300/60 text-lg">Belum ada semester.</p>
          <p className="text-blue-400/40 text-sm mt-2">Klik "Tambah Semester" untuk memulai!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {semesters.map((semester) => (
            <SemesterCard
              key={semester.id}
              semester={semester}
              onAddCourse={handleAddCourse}
              onFileUpload={handleFileUpload}
              onDeleteFile={handleDeleteFile}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
