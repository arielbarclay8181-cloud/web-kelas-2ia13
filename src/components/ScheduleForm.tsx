import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Schedule {
  id: string;
  day: string;
  subject: string;
  time: string;
  room: string;
  lecturer: string;
  method: string;
}

interface ScheduleFormProps {
  schedule: Schedule | null;
  onSubmit: (schedule: Omit<Schedule, 'id'>) => void;
  onCancel: () => void;
}

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const methods = ['Online', 'Offline', 'VClass', 'Classroom', 'Gmeet', 'Zoom', 'Materi'];

export function ScheduleForm({ schedule, onSubmit, onCancel }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    day: '',
    subject: '',
    time: '',
    room: '',
    lecturer: '',
    method: 'Offline',
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        day: schedule.day,
        subject: schedule.subject,
        time: schedule.time,
        room: schedule.room,
        lecturer: schedule.lecturer,
        method: schedule.method,
      });
    }
  }, [schedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      day: '',
      subject: '',
      time: '',
      room: '',
      lecturer: '',
      method: 'Offline',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          {schedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-purple-300" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">Hari</label>
          <select
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all"
            required
          >
            <option value="" className="bg-gray-900">Pilih Hari</option>
            {days.map((day) => (
              <option key={day} value={day} className="bg-gray-900">
                {day}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">Mata Kuliah</label>
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
          <label className="block text-sm font-semibold text-purple-300 mb-2">Waktu</label>
          <input
            type="text"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-purple-400/40 transition-all"
            placeholder="e.g., 08:00 - 10:00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">Ruang</label>
          <input
            type="text"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-purple-400/40 transition-all"
            placeholder="e.g., Lab 301"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">Dosen</label>
          <input
            type="text"
            value={formData.lecturer}
            onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
            className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-purple-400/40 transition-all"
            placeholder="e.g., Dr. Ahmad"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">Metode Pembelajaran</label>
          <select
            value={formData.method}
            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all"
            required
          >
            {methods.map((method) => (
              <option key={method} value={method} className="bg-gray-900">
                {method}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 flex gap-3 justify-end pt-4">
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
            {schedule ? 'Update' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
}
