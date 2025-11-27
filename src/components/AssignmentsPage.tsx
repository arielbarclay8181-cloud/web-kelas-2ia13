import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, CheckCircle2, ClipboardList, ExternalLink } from 'lucide-react';
import { AssignmentForm } from './AssignmentForm';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAdmin } from '../context/AdminContext';

interface Assignment {
  id: string;
  subject: string;
  task: string;
  deadline: string;
  submission: string;
  completed?: boolean;
  createdAt: string;
}

// Helper function to extract and format URLs as clickable links
const TaskDisplay = ({ task, completed }: { task: string; completed?: boolean }) => {
  // Regex to find http/https URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = task.split(urlRegex);

  return (
    <p className={`text-sm mb-4 ${completed ? 'text-purple-300/50 line-through' : 'text-purple-300/80'}`}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          // If the part is a URL
          return (
            <a 
              key={index} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-pink-400 hover:text-pink-300 underline font-medium inline-flex items-center gap-1 transition-colors"
              onClick={(e) => e.stopPropagation()} // Prevent card's click action (if any)
              title="Buka Link Tugas"
            >
              Link Tugas 
              <ExternalLink className="w-3 h-3"/>
            </a>
          );
        }
        // If the part is plain text
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};


export function AssignmentsPage() {
  const { isAdmin } = useAdmin();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/assignments`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = async (assignment: Omit<Assignment, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/assignments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assignment),
        }
      );
      const data = await response.json();
      setAssignments([...assignments, data.assignment]);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding assignment:', error);
    }
  };

  const handleUpdateAssignment = async (id: string, updates: Partial<Assignment>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/assignments/${id}`,
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
      setAssignments(assignments.map(a => a.id === id ? data.assignment : a));
      setEditingAssignment(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
    
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/assignments/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const toggleComplete = (assignment: Assignment) => {
    handleUpdateAssignment(assignment.id, { completed: !assignment.completed });
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const sortedAssignments = [...assignments].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-purple-300">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Daftar Tugas Kuliah
            </h2>
            <p className="text-purple-300/60 mt-1">Track semua tugas dan deadline-nya</p>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => {
                setEditingAssignment(null);
                setShowForm(!showForm);
              }}
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Tambah Tugas</span>
              </div>
            </button>
          )}
        </div>

        {showForm && isAdmin && (
          <div className="mt-6">
            <AssignmentForm
              assignment={editingAssignment}
              onSubmit={(assignment) => {
                if (editingAssignment) {
                  handleUpdateAssignment(editingAssignment.id, assignment);
                } else {
                  handleAddAssignment(assignment);
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingAssignment(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Assignments Grid */}
      {sortedAssignments.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <ClipboardList className="w-10 h-10 text-purple-400" />
          </div>
          <p className="text-purple-300/60 text-lg">Belum ada tugas yang ditambahkan.</p>
          <p className="text-purple-400/40 text-sm mt-2">Klik "Tambah Tugas" untuk memulai!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className={`group relative bg-black/40 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                assignment.completed
                  ? 'border-green-500/30 hover:border-green-500/50'
                  : isOverdue(assignment.deadline)
                  ? 'border-red-500/30 hover:border-red-500/50 shadow-lg shadow-red-500/20'
                  : 'border-purple-500/20 hover:border-purple-500/40 shadow-lg shadow-purple-500/20'
              }`}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                assignment.completed ? 'bg-green-500/5' : isOverdue(assignment.deadline) ? 'bg-red-500/5' : 'bg-purple-500/5'
              }`}></div>

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{assignment.subject}</h3>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      assignment.completed
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : isOverdue(assignment.deadline)
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {assignment.submission}
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => toggleComplete(assignment)}
                      className={`p-2 rounded-lg transition-all ${
                        assignment.completed
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-white/5 text-purple-300 hover:bg-white/10'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  )}
                </div>  

                {/* Task Description (menggunakan komponen baru) */}
                <TaskDisplay 
                  task={assignment.task} 
                  completed={assignment.completed} 
                />

                {/* Deadline */}
                <div className="flex items-center gap-2 mb-4">
                  <Clock className={`w-4 h-4 ${
                    assignment.completed ? 'text-green-400' : isOverdue(assignment.deadline) ? 'text-red-400' : 'text-purple-400'
                  }`} />
                  <span className={`text-sm ${
                    assignment.completed ? 'text-green-300' : isOverdue(assignment.deadline) ? 'text-red-300' : 'text-purple-300'
                  }`}>
                    {new Date(assignment.deadline).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Actions */}
                {isAdmin && (
                  <div className="flex gap-2 pt-4 border-t border-white/5">
                    <button
                      onClick={() => {
                        setEditingAssignment(assignment);
                        setShowForm(true);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}