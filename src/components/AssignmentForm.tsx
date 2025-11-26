import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Assignment {
  id: string;
  subject: string;
  task: string;
  deadline: string;
  submission: string;
  completed?: boolean;
}

interface AssignmentFormProps {
  assignment: Assignment | null;
  onSubmit: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const submissionMethods = [
  'VClass',
  'Google Drive',
  'Google Classroom',
  'Email',
  'WhatsApp',
  'Print',
  'Makalah',
  'Manual (buku tugas)',
];

export function AssignmentForm({ assignment, onSubmit, onCancel }: AssignmentFormProps) {
  const [formData, setFormData] = useState({
    subject: '',
    task: '',
    deadline: '',
    submission: 'VClass',
    completed: false,
  });

  useEffect(() => {
    if (assignment) {
      setFormData({
        subject: assignment.subject,
        task: assignment.task,
        deadline: assignment.deadline,
        submission: assignment.submission,
        completed: assignment.completed || false,
      });
    }
  }, [assignment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      subject: '',
      task: '',
      deadline: '',
      submission: 'VClass',
      completed: false,
    });
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          {assignment ? 'Edit Tugas' : 'Tambah Tugas Baru'}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-purple-300" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            Mata Kuliah
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-purple-400/40 transition-all"
            placeholder="e.g., Pemrograman Web"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            Deskripsi Tugas
          </label>
          <textarea
            value={formData.task}
            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
            className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-purple-400/40 transition-all resize-none"
            rows={3}
            placeholder="Jelaskan detail tugas..."
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-2">
              Deadline
            </label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-2">
              Metode Pengumpulan
            </label>
            <select
              value={formData.submission}
              onChange={(e) => setFormData({ ...formData, submission: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all"
              required
            >
              {submissionMethods.map((method) => (
                <option key={method} value={method} className="bg-gray-900">
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 transition-all font-semibold"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all hover:scale-105"
          >
            {assignment ? 'Update' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
}
