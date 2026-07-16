import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, CalendarClock, Users, BookOpen, UserCog, LogOut, Settings, Database } from 'lucide-react';
import clsx from 'clsx';
import { fetchAllData } from '../../api';
import { useStore } from '../../store';

export default function AdminLayout() {
  const location = useLocation();
  const { users, setTahunAjaran, setKelas, setSiswa, setUsers, setJadwal } = useStore();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('admin_logged_in') === 'true';
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const allData = await fetchAllData();
        if (allData) {
          if (allData.tahunAjaran) setTahunAjaran(allData.tahunAjaran);
          if (allData.kelas) setKelas(allData.kelas);
          if (allData.siswa) setSiswa(allData.siswa);
          if (allData.users) setUsers(allData.users);
          if (allData.jadwal) setJadwal(allData.jadwal);
        } else {
          setErrorMsg('Data tidak ditemukan atau format tidak valid.');
        }
      } catch (err: any) {
        setErrorMsg('Error: ' + err.message);
      }
      setLoading(false);
    };
    loadData();
  }, [setTahunAjaran, setKelas, setSiswa, setUsers, setJadwal]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const lowerUser = loginUsername.trim().toLowerCase();
    // Allow master login 'admin' with 'admin123', or any user matching from the database
    const userExists = users.some(u => u.username.toLowerCase() === lowerUser) || lowerUser === 'admin' || lowerUser === 'admin123';
    
    if (userExists && loginPassword === 'admin123') {
      sessionStorage.setItem('admin_logged_in', 'true');
      sessionStorage.setItem('admin_user', lowerUser);
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Username atau Password salah! (Default password: admin123)');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_user');
    setIsLoggedIn(false);
  };

  const navigation = [
    { name: 'Jadwal Harian', href: '/admin/jadwal', icon: CalendarDays },
    { name: 'Tahun Ajaran', href: '/admin/tahun-ajaran', icon: CalendarClock },
    { name: 'Management Kelas', href: '/admin/kelas', icon: BookOpen },
    { name: 'Data Siswa', href: '/admin/siswa', icon: Users },
    { name: 'Role & User', href: '/admin/users', icon: UserCog },
    { name: 'Konfigurasi Database', href: '/admin/database', icon: Database },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl text-white mb-3 shadow-lg shadow-blue-500/20">
              <CalendarClock size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">One Gate System</h2>
            <p className="text-sm text-gray-500 font-medium">Administrator Login Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100 font-semibold">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input
                required
                type="text"
                placeholder="Masukkan username"
                className="w-full border-gray-300 rounded-lg p-3 border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                required
                type="password"
                placeholder="Masukkan password"
                className="w-full border-gray-300 rounded-lg p-3 border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1.5 font-mono"> </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 mt-2"
            >
              Masuk ke Admin Panel
            </button>
            
            <Link
              to="/"
              className="block text-center text-sm font-medium text-gray-500 hover:text-gray-700 mt-2"
            >
              Kembali ke Halaman Utama
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row print:bg-white print:block">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white flex flex-col print:hidden">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Settings className="mr-3 h-5 w-5 text-gray-400" />
          <span className="text-lg font-bold">Admin Panel</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon
                  className={clsx(
                    'mr-3 flex-shrink-0 h-5 w-5',
                    isActive ? 'text-white' : 'text-gray-400'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors w-full text-left"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-red-400" />
            Keluar (Log Out)
          </button>
          
          <Link
            to="/"
            className="flex items-center px-3 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors w-full"
          >
            Kembali ke Dashboard Utama
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:block">
        <header className="bg-white shadow-sm h-16 flex items-center px-6 sm:px-8 print:hidden">
          <h2 className="text-lg font-semibold text-gray-800">
            {navigation.find(n => n.href === location.pathname)?.name || 'Admin'}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 print:p-0 print:overflow-visible print:block">
          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg print:hidden">
              {errorMsg}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-64 print:hidden">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
