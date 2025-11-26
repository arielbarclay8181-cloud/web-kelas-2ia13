import { useState, useEffect } from 'react';
import { Plus, Users2, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Member {
  id: string;
  name: string;
  npm: string;
}

interface Team {
  id: string;
  name: string;
  members: Member[];
}

interface Group {
  id: string;
  subject: string;
  teams: Team[];
}

export function GroupsPage() {
  const { isAdmin } = useAdmin();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [addingTeamTo, setAddingTeamTo] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [addingMemberTo, setAddingMemberTo] = useState<{ groupId: string; teamId: string } | null>(null);
  const [newMember, setNewMember] = useState({ name: '', npm: '' });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/groups`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/groups`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subject: newSubject }),
        }
      );
      const data = await response.json();
      setGroups([...groups, data.group]);
      setNewSubject('');
      setShowGroupForm(false);
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const handleAddTeam = async (groupId: string) => {
    if (!newTeamName.trim()) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/groups/${groupId}/teams`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newTeamName }),
        }
      );
      const data = await response.json();
      setGroups(groups.map(g => 
        g.id === groupId 
          ? { ...g, teams: [...g.teams, data.team] }
          : g
      ));
      setNewTeamName('');
      setAddingTeamTo(null);
    } catch (error) {
      console.error('Error adding team:', error);
    }
  };

  const handleAddMember = async () => {
    if (!addingMemberTo || !newMember.name.trim() || !newMember.npm.trim()) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/groups/${addingMemberTo.groupId}/teams/${addingMemberTo.teamId}/members`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMember),
        }
      );
      const data = await response.json();
      
      setGroups(groups.map(g => 
        g.id === addingMemberTo.groupId
          ? {
              ...g,
              teams: g.teams.map(t =>
                t.id === addingMemberTo.teamId
                  ? { ...t, members: [...t.members, data.member] }
                  : t
              )
            }
          : g
      ));
      
      setNewMember({ name: '', npm: '' });
      setAddingMemberTo(null);
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mata kuliah dan semua kelompoknya?')) return;
    
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/groups/${groupId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      setGroups(groups.filter(g => g.id !== groupId));
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleDeleteTeam = async (groupId: string, teamId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelompok ini?')) return;
    
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/groups/${groupId}/teams/${teamId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      setGroups(groups.map(g => 
        g.id === groupId
          ? { ...g, teams: g.teams.filter(t => t.id !== teamId) }
          : g
      ));
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleDeleteMember = async (groupId: string, teamId: string, memberId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota ini?')) return;
    
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/groups/${groupId}/teams/${teamId}/members/${memberId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      setGroups(groups.map(g => 
        g.id === groupId
          ? {
              ...g,
              teams: g.teams.map(t =>
                t.id === teamId
                  ? { ...t, members: t.members.filter(m => m.id !== memberId) }
                  : t
              )
            }
          : g
      ));
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg">
                <Users2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Kelompok Mata Kuliah
              </h2>
              <p className="text-cyan-300/60 text-sm">Organisasi kelompok per mata kuliah</p>
            </div>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setShowGroupForm(!showGroupForm)}
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Tambah Mata Kuliah</span>
              </div>
            </button>
          )}
        </div>

        {showGroupForm && isAdmin && (
          <form onSubmit={handleAddGroup} className="mb-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-6 border-2 border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Tambah Mata Kuliah Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowGroupForm(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-cyan-300" />
              </button>
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="flex-1 px-4 py-3 bg-black/40 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-cyan-400/40 transition-all"
                placeholder="Nama Mata Kuliah (e.g., Pemrograman Web)"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all hover:scale-105"
              >
                Simpan
              </button>
            </div>
          </form>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-12 text-center">
          <Users2 className="w-16 h-16 mx-auto mb-4 text-cyan-400/30" />
          <p className="text-cyan-300/50 text-lg">Belum ada mata kuliah dengan kelompok.</p>
          <p className="text-cyan-400/40 text-sm mt-2">Tambah mata kuliah untuk mulai membuat kelompok!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-black/40 backdrop-blur-xl rounded-2xl border border-cyan-500/20 overflow-hidden shadow-xl">
              <div
                className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 cursor-pointer group/header"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                      <Users2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{group.subject}</h3>
                      <p className="text-cyan-300/60 text-sm">{group.teams.length} kelompok</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id);
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {expandedGroups.has(group.id) ? (
                      <ChevronUp className="w-5 h-5 text-cyan-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-cyan-300" />
                    )}
                  </div>
                </div>
              </div>

              {expandedGroups.has(group.id) && (
                <div className="p-4 space-y-4">
                  {isAdmin && (
                    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30">
                      {addingTeamTo === group.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            className="flex-1 px-4 py-2 bg-black/40 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-cyan-400/40"
                            placeholder="Nama Kelompok (e.g., Kelompok 1)"
                          />
                          <button
                            onClick={() => setAddingTeamTo(null)}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 transition-all"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleAddTeam(group.id)}
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all"
                          >
                            Tambah
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingTeamTo(group.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all text-cyan-300 font-semibold"
                        >
                          <Plus className="w-4 h-4" />
                          Tambah Kelompok Baru
                        </button>
                      )}
                    </div>
                  )}

                  {group.teams.length === 0 ? (
                    <p className="text-center text-cyan-300/50 py-8">Belum ada kelompok.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.teams.map((team) => (
                        <div key={team.id} className="bg-gradient-to-br from-cyan-900/10 to-blue-900/10 backdrop-blur-sm rounded-xl border border-cyan-500/20 overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-3 flex items-center justify-between">
                            <h4 className="text-white font-bold">{team.name}</h4>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteTeam(group.id, team.id)}
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="p-3 space-y-2">
                            {team.members.map((member, idx) => (
                              <div key={member.id} className="flex items-center justify-between p-2 bg-black/20 rounded-lg group/member">
                                <div className="flex items-center gap-2">
                                  <span className="text-cyan-400 font-semibold text-sm">{idx + 1}.</span>
                                  <div>
                                    <p className="text-white text-sm font-semibold">{member.name}</p>
                                    <p className="text-cyan-300/60 text-xs">{member.npm}</p>
                                  </div>
                                </div>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteMember(group.id, team.id, member.id)}
                                    className="p-1 text-red-400 opacity-0 group-hover/member:opacity-100 hover:bg-red-500/20 rounded transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                            
                            {isAdmin && (
                              <>
                                {addingMemberTo?.groupId === group.id && addingMemberTo?.teamId === team.id ? (
                                  <div className="pt-2 space-y-2">
                                    <input
                                      type="text"
                                      value={newMember.name}
                                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                      className="w-full px-3 py-2 bg-black/40 border border-cyan-500/30 rounded-lg text-white placeholder-cyan-400/40 text-sm"
                                      placeholder="Nama Anggota"
                                    />
                                    <input
                                      type="text"
                                      value={newMember.npm}
                                      onChange={(e) => setNewMember({ ...newMember, npm: e.target.value })}
                                      className="w-full px-3 py-2 bg-black/40 border border-cyan-500/30 rounded-lg text-white placeholder-cyan-400/40 text-sm"
                                      placeholder="NPM"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setAddingMemberTo(null)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-sm"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleAddMember}
                                        className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm"
                                      >
                                        Tambah
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setAddingMemberTo({ groupId: group.id, teamId: team.id })}
                                    className="w-full mt-2 px-3 py-2 border border-dashed border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all text-cyan-300 text-sm font-semibold"
                                  >
                                    + Tambah Anggota
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
