import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ScheduleTable } from './ScheduleTable';
import { AnnouncementPanel } from './AnnouncementPanel';
import { ScheduleForm } from './ScheduleForm';
import { useAdmin } from '../context/AdminContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Schedule {
  id: string;
  day: string;
  subject: string;
  time: string;
  room: string;
  lecturer: string;
  method: string;
}

export function SchedulePage() {
  const { isAdmin } = useAdmin();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/schedules`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (schedule: Omit<Schedule, 'id'>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/schedules`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(schedule),
        }
      );
      const data = await response.json();
      setSchedules([...schedules, data.schedule]);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const handleUpdateSchedule = async (id: string, updates: Partial<Schedule>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/schedules/${id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );
      const data = await response.json();
      setSchedules(schedules.map(s => s.id === id ? data.schedule : s));
      setEditingSchedule(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/schedules/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      setSchedules(schedules.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Announcements */}
      <AnnouncementPanel />

      {/* Schedule Section */}
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Jadwal Kuliah
            </h2>
            <p className="text-purple-300/60 mt-1">M9</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingSchedule(null);
                setShowForm(!showForm);
              }}
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Tambah Jadwal</span>
              </div>
            </button>
          )}
        </div>

        {showForm && isAdmin && (
          <div className="mb-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/30">
              <ScheduleForm
                schedule={editingSchedule}
                onSubmit={(schedule) => {
                  if (editingSchedule) {
                    handleUpdateSchedule(editingSchedule.id, schedule);
                  } else {
                    handleAddSchedule(schedule);
                  }
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditingSchedule(null);
                }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-2 text-purple-300">Memuat jadwal...</p>
          </div>
        ) : (
            <ScheduleTable
            schedules={schedules}
            onEdit={handleEdit}
            onDelete={handleDeleteSchedule}
            isAdmin={isAdmin} 
          />
        )}
      </div>
    </div>
  );
}