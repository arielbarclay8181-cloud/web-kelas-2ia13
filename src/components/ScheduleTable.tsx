import { Edit2, Trash2 } from 'lucide-react';

interface Schedule {
  id: string;
  day: string;
  subject: string;
  time: string;
  room: string;
  lecturer: string;
  method: string;
}

interface ScheduleTableProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean; 
}

const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const methodColors: Record<string, string> = {
  'Online': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Offline': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'VClass': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Classroom': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Hybrid': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Teams': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'Zoom': 'bg-cyan-500/20 text-cyan-300 border-cyan-300/30',
  'Gmeet': 'bg-red-500/20 text-red-300 border-red-500/30', 
  'Materi': 'bg-gray-500/20 text-gray-300 border-gray-500/30', 
};

export function ScheduleTable({ schedules, onEdit, onDelete, isAdmin }: ScheduleTableProps) {
  const sortedSchedules = [...schedules].sort((a, b) => {
    const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    if (dayComparison !== 0) return dayComparison;
    return a.time.localeCompare(b.time);
  });

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 text-purple-300/60">
        <p>Belum ada jadwal. Klik tombol "Tambah Jadwal" untuk menambahkan jadwal baru.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <div className="inline-block min-w-full align-middle px-6">
        <div className="overflow-hidden rounded-xl border border-purple-500/20">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-4 text-left font-bold text-purple-300">Hari</th>
                <th className="px-4 py-4 text-left font-bold text-purple-300">Mata Kuliah</th>
                <th className="px-4 py-4 text-left font-bold text-purple-300">Waktu</th>
                <th className="px-4 py-4 text-left font-bold text-purple-300">Ruang</th>
                <th className="px-4 py-4 text-left font-bold text-purple-300 hidden md:table-cell">Dosen</th>
                <th className="px-4 py-4 text-left font-bold text-purple-300 hidden lg:table-cell">Metode</th>
                {isAdmin && ( 
                  <th className="px-4 py-4 text-right font-bold text-purple-300">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {sortedSchedules.map((schedule) => (
                <tr 
                  key={schedule.id} 
                  className="group hover:bg-purple-500/5 transition-all duration-200"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {schedule.day}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-white font-semibold">{schedule.subject}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-purple-300/80">
                    {schedule.time}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {schedule.room}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-purple-300/80 hidden md:table-cell">
                    {schedule.lecturer}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${
                      methodColors[schedule.method] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}>
                      {schedule.method}
                    </span>
                  </td>
                  
                  {isAdmin && ( 
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(schedule)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(schedule.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Hapus"
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
  );
}