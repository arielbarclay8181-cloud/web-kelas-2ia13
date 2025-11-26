import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { CourseSection } from './CourseSection';

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

interface SemesterCardProps {
  semester: Semester;
  onAddCourse: (semesterId: string, courseName: string) => void;
  onFileUpload: (semesterId: string, courseId: string, file: File) => void;
  onDeleteFile: (semesterId: string, courseId: string, fileId: string) => void;
  isAdmin: boolean;
}

export function SemesterCard({
  semester,
  onAddCourse,
  onFileUpload,
  onDeleteFile,
  isAdmin,
}: SemesterCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    onAddCourse(semester.id, newCourseName);
    setNewCourseName('');
    setShowAddCourse(false);
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl">
      <div
        className="relative bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Animated Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-50"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-500 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                <span className="text-white font-black text-lg">S{semester.number}</span>
              </div>
            </div>
            <div>
              <h3 className="text-white text-xl font-black">{semester.name}</h3>
              <p className="text-blue-300/60 text-sm">
                {semester.courses.length} mata kuliah • {semester.courses.reduce((acc, c) => acc + c.files.length, 0)} file
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isExpanded && isAdmin &&(
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddCourse(!showAddCourse);
                }}
                className="group/btn relative p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-110"
                title="Tambah Mata Kuliah"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            )}
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-white" />
            ) : (
              <ChevronDown className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-4">
          {showAddCourse && isAdmin && (
            <form
              onSubmit={handleAddCourse}
              className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30"
            >
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                Nama Mata Kuliah
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="flex-1 px-4 py-3 bg-black/40 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-blue-400/40 transition-all"
                  placeholder="e.g., Pemrograman Web"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCourse(false);
                    setNewCourseName('');
                  }}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-blue-300 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg shadow-blue-500/50 hover:shadow-blue-500/80 transition-all hover:scale-105"
                >
                  Tambah
                </button>
              </div>
            </form>
          )}

          {semester.courses.length === 0 ? (
            <p className="text-center py-12 text-blue-300/50">
              Belum ada mata kuliah. Klik tombol + untuk menambahkan.
            </p>
          ) : (
            <div className="space-y-4">
              {semester.courses.map((course) => (
                <CourseSection
                  key={course.id}
                  course={course}
                  semesterId={semester.id}
                  onFileUpload={onFileUpload}
                  onDeleteFile={onDeleteFile}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
