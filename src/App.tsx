import { useState, useEffect } from 'react';
import { Menu, X, Calendar, BookOpen, ClipboardList, GraduationCap, Users, Users2, FileText, Heart, Shield } from 'lucide-react';
import { AdminProvider } from './context/AdminContext';
import { SchedulePage } from './components/SchedulePage';
import { MaterialsPage } from './components/MaterialsPage';
import { AssignmentsPage } from './components/AssignmentsPage';
import { StudentsPage } from './components/StudentsPage';
import { GroupsPage } from './components/GroupsPage';
import { ExamsPage } from './components/ExamsPage';
import { MomentsPage } from './components/MomentsPage';
import { AdminPage } from './components/AdminPage';
import logo from '../image/logo.png';


type PageType = 'schedule' | 'exams' | 'materials' | 'assignments' | 'students' | 'groups' | 'moments' | 'admin';

function AppContent() {
  const [activePage, setActivePage] = useState<PageType>('schedule');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navigation = [
    { id: 'schedule', name: 'Jadwal Kuliah', icon: Calendar, color: 'purple' },
    { id: 'exams', name: 'Jadwal Ujian', icon: FileText, color: 'yellow' },
    { id: 'materials', name: 'Materi', icon: BookOpen, color: 'blue' },
    { id: 'assignments', name: 'Tugas', icon: ClipboardList, color: 'pink' },
    { id: 'students', name: 'Data Mahasiswa', icon: Users, color: 'green' },
    { id: 'groups', name: 'Kelompok', icon: Users2, color: 'cyan' },
    { id: 'moments', name: 'Moments', icon: Heart, color: 'rose' },
    { id: 'admin', name: 'Admin', icon: Shield, color: 'red' },
  ];

  const ConnectionIndicator = () => {
    const color = isOnline ? 'bg-green-500' : 'bg-red-500';
    const text = isOnline ? 'Online' : 'Offline';
    const textColor = isOnline ? 'text-green-300' : 'text-red-300';
    const borderColor = isOnline ? 'border-green-500/30' : 'border-red-500/30';
    const pulse = isOnline ? 'animate-pulse' : '';

    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${color}/20 border ${borderColor}`}>
        <div className={`w-2 h-2 rounded-full ${color} ${pulse}`}></div>
        <span className={`${textColor} text-sm font-semibold`}>{text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0118] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-600/10 to-transparent rounded-full animate-pulse-slow"></div>
      </div>

      {/* Neon Grid Lines */}
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 h-full w-64 bg-black/40 backdrop-blur-xl border-r border-purple-500/20 transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              
              <img 
                src="https://web-kelas-2ia13-rrr7.vercel.app/assets/logo-Dvjqs8cd.png"
                alt="2IA13 Logo" 
                className="w-10 h-10 object-contain" 
              />

              <div>
                <h2 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-xl tracking-tight">
                  2IA13
                </h2>
              </div>
            </div>
            <p className="text-purple-300/60 text-xs uppercase tracking-wider">Informatika</p>
            <p className="text-purple-400/80 text-sm">Universitas Gunadarma</p>
          </div>
          
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id as PageType);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 text-white'
                      : 'text-purple-300/70 hover:bg-white/5 hover:text-purple-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="font-semibold">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Decorative Element */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none"></div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="lg:ml-64 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-xl border-b border-purple-500/20">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-purple-300"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div>
                  <h1 className="font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 tracking-tight">
                    {navigation.find(n => n.id === activePage)?.name}
                  </h1>
                </div>
              </div>
              
              {/* Indikator Online/Offline */}
              <ConnectionIndicator />
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {activePage === 'schedule' && <SchedulePage />}
            {activePage === 'exams' && <ExamsPage />}
            {activePage === 'materials' && <MaterialsPage />}
            {activePage === 'assignments' && <AssignmentsPage />}
            {activePage === 'students' && <StudentsPage />}
            {activePage === 'groups' && <GroupsPage />}
            {activePage === 'moments' && <MomentsPage />}
            {activePage === 'admin' && <AdminPage />}
          </main>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Space Grotesk', sans-serif;
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.15; transform: translate(-50%, -50%) scale(1.05); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
}