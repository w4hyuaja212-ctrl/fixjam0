import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { fetchAllData } from '../api';
import { formatIndonesianDate } from '../utils';
import { Link } from 'react-router-dom';
import { 
  CalendarClock, 
  Clock, 
  User, 
  LogIn, 
  Building, 
  Megaphone, 
  BookOpen, 
  Calendar, 
  Filter, 
  Play, 
  Camera, 
  Phone, 
  MessageCircle, 
  Share2, 
  Compass, 
  Sparkles,
  BookMarked
} from 'lucide-react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';

export default function PublicDashboard() {
  const { jadwal, setJadwal, setKelas, setSiswa, setTahunAjaran } = useStore();
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan'>('harian');

  useEffect(() => {
    const loadData = async () => {
      const allData = await fetchAllData();
      if (allData) {
        if (allData.jadwal) setJadwal(allData.jadwal);
        if (allData.kelas) setKelas(allData.kelas);
        if (allData.siswa) setSiswa(allData.siswa);
        if (allData.tahunAjaran) setTahunAjaran(allData.tahunAjaran);
      }
      setLoading(false);
    };
    loadData();
  }, [setJadwal, setKelas, setSiswa, setTahunAjaran]);

  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

  const filteredJadwal = jadwal.filter(j => {
    const itemDate = parseISO(j.tanggal);
    if (filterMode === 'harian') {
      return j.tanggal === todayStr;
    } else if (filterMode === 'mingguan') {
      return isWithinInterval(itemDate, {
        start: startOfWeek(todayDate, { weekStartsOn: 1 }), // Start on Monday
        end: endOfWeek(todayDate, { weekStartsOn: 1 })
      });
    } else if (filterMode === 'bulanan') {
      return isWithinInterval(itemDate, {
        start: startOfMonth(todayDate),
        end: endOfMonth(todayDate)
      });
    } else if (filterMode === 'tahunan') {
      return isWithinInterval(itemDate, {
        start: startOfYear(todayDate),
        end: endOfYear(todayDate)
      });
    }
    return true;
  }).sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  // For 'harian' mode, if empty we try to fallback to the first item for demo purposes if nothing matches today
  const dailyJadwal = (filterMode === 'harian' && filteredJadwal.length === 0 && jadwal.length > 0) 
    ? [jadwal[0]] 
    : filteredJadwal;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Top Bar Accent */}
      <div className="h-2 bg-gradient-to-r from-emerald-800 via-amber-400 to-emerald-900 w-full" />

      {/* Header */}
      <header className="bg-emerald-950 text-white sticky top-0 z-50 shadow-md border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-2.5 rounded-2xl shadow-md border border-amber-300 text-emerald-950 flex-shrink-0 animate-pulse">
              <CalendarClock className="h-6 w-6 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500 text-emerald-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  PROGRAM UTAMA
                </span>
                <span className="text-xs text-amber-300 font-bold tracking-wide">
                  Wakil ISMUBA
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mt-1">
                One Gate System
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 font-medium">
                SMA Muhammadiyah 1 Palembang
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              to="/admin"
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 px-5 py-2.5 rounded-xl transition-all text-sm font-black shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 border border-amber-400 active:scale-95"
            >
              <LogIn size={16} className="stroke-[3]" />
              <span>Login Admin / Piket</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 text-white py-12 px-4 shadow-inner relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-emerald-800/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-800/50 border border-emerald-700/80 px-4 py-1.5 rounded-full text-xs text-amber-300 font-bold mb-4 tracking-wide shadow-sm">
            <Compass size={14} className="animate-spin duration-1000" />
            Sistem Informasi Pengawasan Ibadah & Kegiatan Keagamaan
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Menegakkan Disiplin, <span className="text-amber-400">Meraih Berkah</span>
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-emerald-100 max-w-2xl mx-auto font-medium">
            Portal digital pengawasan program Jam Ke-0, Tadarus Al-Qur'an, Kultum, Azan, Salat Dzuhur Berjamaah, dan Piket Simpatik Terintegrasi.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Navigation & Controls */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white p-5 rounded-2xl shadow-sm border border-neutral-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <h2 className="text-xl font-bold text-neutral-900">
                Aktivitas Keagamaan {filterMode === 'harian' ? 'Hari Ini' : filterMode === 'mingguan' ? 'Minggu Ini' : filterMode === 'bulanan' ? 'Bulan Ini' : 'Tahun Ini'}
              </h2>
            </div>
            <p className="text-neutral-500 text-sm mt-1 font-semibold flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-600" />
              {filterMode === 'harian' ? (
                formatIndonesianDate(dailyJadwal[0]?.tanggal || todayStr)
              ) : (
                `Rentang jadwal aktif sesuai filter (${filterMode})`
              )}
            </p>
          </div>
          
          <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-xl p-1 shadow-inner self-start sm:self-center">
            <span className="text-xs font-bold text-neutral-500 px-2.5 flex items-center gap-1">
              <Filter size={12} /> Filter:
            </span>
            <div className="flex gap-1">
              {(['harian', 'mingguan', 'bulanan', 'tahunan'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                    filterMode === mode 
                      ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20' 
                      : 'text-neutral-600 hover:bg-neutral-200/70'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-72 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-amber-400"></div>
            <p className="text-neutral-500 text-sm font-semibold animate-pulse">Memuat Agenda Kegiatan Sekolah...</p>
          </div>
        ) : filterMode === 'harian' ? (
          dailyJadwal.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Card Gedung A */}
              <div className="bg-white rounded-3xl shadow-md border border-neutral-200/60 overflow-hidden flex flex-col hover:shadow-lg transition-all transform hover:-translate-y-1">
                {/* Header Gedung */}
                <div className="bg-emerald-850 px-6 py-5 flex items-center justify-between border-b border-emerald-900/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-400 text-emerald-950 p-2 rounded-xl font-bold">
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-none">Gedung A</h3>
                      <p className="text-emerald-300 text-xs mt-0.5 font-medium"> </p>
                    </div>
                  </div>
                  <span className="bg-emerald-900/60 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-800">
                    Siswa Gedung A
                  </span>
                </div>
                
                {/* Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col gap-6">
                  
                  {/* Highlighted Jam ke 0 */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 text-emerald-600/10 pointer-events-none">
                      <BookMarked size={120} />
                    </div>
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                      <div className="bg-emerald-200 text-emerald-800 p-1.5 rounded-lg">
                        <Clock size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-emerald-950 uppercase tracking-wider text-xs">Jadwal Jam Ke-0</h4>
                        <p className="text-[10px] text-emerald-700 font-bold">Pukul 06.40 - 07.00 WIB</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-emerald-200/50 shadow-inner mt-2">
                      <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Kelas Terjadwal:</p>
                      <p className="text-2xl font-black text-emerald-900 mt-1 leading-tight tracking-tight">
                        {dailyJadwal[0].jamKe0GedungA || <span className="text-neutral-300 italic font-medium">Tidak ada kegiatan</span>}
                      </p>
                    </div>
                  </div>
                  
                  <hr className="border-neutral-100" />
                  
                  {/* Salat Dzuhur */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-amber-100 text-amber-800 p-1.5 rounded-lg">
                          <Sparkles size={16} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-neutral-900 uppercase tracking-wider text-xs">Aktivitas Salat Dzuhur</h4>
                          <p className="text-[10px] text-neutral-500 font-medium">Program Kedisiplinan Berjamaah</p>
                        </div>
                      </div>
                      <span className="text-xs bg-amber-500/10 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                        Masjid / Mushola A
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/50">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Peserta Salat (Kelas):</p>
                        <p className="text-lg font-black text-emerald-950 mt-1">
                          {dailyJadwal[0].dzuhurGedungA || <span className="text-neutral-300 italic font-medium">-</span>}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-150">
                          <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1 font-bold uppercase tracking-wider"><Megaphone size={12} className="text-emerald-700"/> Petugas Kultum</p>
                          <p className="font-black text-neutral-800 text-sm">{dailyJadwal[0].kultumGedungA || <span className="text-neutral-300 italic font-medium">-</span>}</p>
                          {dailyJadwal[0].cadanganKultumGedungA && (
                            <p className="text-[10px] text-amber-600 font-bold mt-1">
                              Cadangan: {dailyJadwal[0].cadanganKultumGedungA}
                            </p>
                          )}
                        </div>
                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-150">
                          <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1 font-bold uppercase tracking-wider"><User size={12} className="text-emerald-700"/> Petugas Azan</p>
                          <p className="font-black text-neutral-800 text-sm">{dailyJadwal[0].azanGedungA || <span className="text-neutral-300 italic font-medium">-</span>}</p>
                        </div>
                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-150 sm:col-span-2">
                          <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1 font-bold uppercase tracking-wider"><BookOpen size={12} className="text-emerald-700"/> Tadarus / Piket Simpatik</p>
                          <p className="font-black text-neutral-800 text-sm">{dailyJadwal[0].tadarusGedungA || <span className="text-neutral-300 italic font-medium">-</span>}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Card Gedung B */}
              <div className="bg-white rounded-3xl shadow-md border border-neutral-200/60 overflow-hidden flex flex-col hover:shadow-lg transition-all transform hover:-translate-y-1">
                {/* Header Gedung */}
                <div className="bg-emerald-900 px-6 py-5 flex items-center justify-between border-b border-emerald-950/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-400 text-emerald-950 p-2 rounded-xl font-bold">
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-none">Gedung B</h3>
                      <p className="text-emerald-300 text-xs mt-0.5 font-medium"> </p>
                    </div>
                  </div>
                  <span className="bg-emerald-950/60 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-800">
                    Siswa Gedung B
                  </span>
                </div>
                
                {/* Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col gap-6">
                  
                  {/* Highlighted Jam ke 0 */}
                  <div className="bg-gradient-to-br from-amber-50/50 to-amber-100/30 rounded-2xl p-5 border border-amber-200/55 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 text-amber-600/10 pointer-events-none">
                      <BookMarked size={120} />
                    </div>
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                      <div className="bg-amber-200 text-amber-950 p-1.5 rounded-lg">
                        <Clock size={16} className="stroke-[2.5] text-amber-900" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-amber-950 uppercase tracking-wider text-xs">Jadwal Jam Ke-0</h4>
                        <p className="text-[10px] text-amber-800 font-bold">Pukul 06.40 - 07.00 WIB</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-amber-200/50 shadow-inner mt-2">
                      <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Kelas Terjadwal:</p>
                      <p className="text-2xl font-black text-amber-950 mt-1 leading-tight tracking-tight">
                        {dailyJadwal[0].jamKe0GedungB || <span className="text-neutral-300 italic font-medium">Tidak ada kegiatan</span>}
                      </p>
                    </div>
                  </div>
                  
                  <hr className="border-neutral-100" />
                  
                  {/* Salat Dzuhur */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                          <Sparkles size={16} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-neutral-900 uppercase tracking-wider text-xs">Aktivitas Salat Dzuhur</h4>
                          <p className="text-[10px] text-neutral-500 font-medium">Program Kedisiplinan Berjamaah</p>
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-500/10 text-emerald-850 font-bold px-2 py-0.5 rounded-md">
                        Masjid / Mushola B
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/50">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Peserta Salat (Kelas):</p>
                        <p className="text-lg font-black text-emerald-950 mt-1">
                          {dailyJadwal[0].dzuhurGedungB || <span className="text-neutral-300 italic font-medium">-</span>}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-150">
                          <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1 font-bold uppercase tracking-wider"><Megaphone size={12} className="text-emerald-700"/> Petugas Kultum</p>
                          <p className="font-black text-neutral-800 text-sm">{dailyJadwal[0].kultumGedungB || <span className="text-neutral-300 italic font-medium">-</span>}</p>
                          {dailyJadwal[0].cadanganKultumGedungB && (
                            <p className="text-[10px] text-amber-600 font-bold mt-1">
                              Cadangan: {dailyJadwal[0].cadanganKultumGedungB}
                            </p>
                          )}
                        </div>
                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-150">
                          <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1 font-bold uppercase tracking-wider"><User size={12} className="text-emerald-700"/> Petugas Azan</p>
                          <p className="font-black text-neutral-800 text-sm">{dailyJadwal[0].azanGedungB || <span className="text-neutral-300 italic font-medium">-</span>}</p>
                        </div>
                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-150 sm:col-span-2">
                          <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1 font-bold uppercase tracking-wider"><BookOpen size={12} className="text-emerald-700"/> Tadarus / Piket Simpatik</p>
                          <p className="font-black text-neutral-800 text-sm">{dailyJadwal[0].tadarusGedungB || <span className="text-neutral-300 italic font-medium">-</span>}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center shadow-md border border-neutral-200">
              <Calendar className="mx-auto h-16 w-16 text-emerald-900/10 mb-4" />
              <h3 className="text-lg font-bold text-neutral-800">Hari ini libur / Tidak ada jadwal</h3>
              <p className="text-neutral-500 text-sm mt-1">Pilih filter Mingguan atau Bulanan untuk melihat agenda mendatang.</p>
            </div>
          )
        ) : (
          /* List View for Weekly/Monthly/Yearly with Enhanced Table Styling */
          <div className="bg-white rounded-3xl shadow-md border border-neutral-200 overflow-hidden">
            {filteredJadwal.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-emerald-950 text-white">
                    <tr>
                      <th className="px-6 py-5 font-bold border-b border-emerald-900 text-xs uppercase tracking-wider">Hari / Tanggal</th>
                      <th className="px-6 py-5 font-bold border-b border-emerald-900 bg-emerald-900 text-xs uppercase tracking-wider text-amber-300">Jam Ke-0 (A)</th>
                      <th className="px-6 py-5 font-bold border-b border-emerald-900 bg-emerald-850 text-xs uppercase tracking-wider text-amber-300">Jam Ke-0 (B)</th>
                      <th className="px-6 py-5 font-bold border-b border-emerald-900 bg-emerald-900 text-xs uppercase tracking-wider text-white">Dzuhur (A)</th>
                      <th className="px-6 py-5 font-bold border-b border-emerald-900 bg-emerald-850 text-xs uppercase tracking-wider text-white">Dzuhur (B)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredJadwal.map((j) => (
                      <tr key={j.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-6 py-5 font-bold text-neutral-800">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-emerald-700" />
                            {formatIndonesianDate(j.tanggal)}
                          </div>
                        </td>
                        <td className="px-6 py-5 bg-emerald-50/10 font-bold text-emerald-900">{j.jamKe0GedungA || <span className="text-neutral-300">-</span>}</td>
                        <td className="px-6 py-5 bg-amber-50/10 font-bold text-amber-900">{j.jamKe0GedungB || <span className="text-neutral-300">-</span>}</td>
                        <td className="px-6 py-5 bg-emerald-50/5 text-neutral-800 font-semibold">{j.dzuhurGedungA || <span className="text-neutral-300">-</span>}</td>
                        <td className="px-6 py-5 bg-amber-50/5 text-neutral-800 font-semibold">{j.dzuhurGedungB || <span className="text-neutral-300">-</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center">
                <Calendar className="mx-auto h-16 w-16 text-emerald-900/10 mb-4 animate-bounce" />
                <h3 className="text-lg font-black text-neutral-800">Agenda Kosong</h3>
                <p className="mt-1 text-neutral-500 font-medium">Belum ada jadwal yang dimasukkan oleh petugas piket / admin untuk periode ini.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer dengan Brand Identitas & Sosial Media */}
      <footer className="bg-emerald-950 text-emerald-100 border-t-4 border-amber-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-emerald-900">
            
            {/* Column 1: School Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-400 p-2 rounded-xl text-emerald-950 font-bold">
                  <CalendarClock size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">One Gate System</h4>
                  <p className="text-xs text-amber-300 font-bold">Wakil ISMUBA SMA Muhammadiyah 1</p>
                </div>
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed font-medium">
                Sistem monitoring aktivitas ibadah, mendampingi siswa untuk membentuk akhlak mulia, berprestasi, berkemajuan, serta berdisiplin tinggi sesuai ajaran Islam.
              </p>
            </div>

            {/* Column 2: Social Media links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-4 border-amber-400 pl-2">
                Media Sosial Resmi
              </h4>
              <div className="space-y-3">
                <a 
                  href="https://youtube.com/@smam1plg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2.5 text-xs font-bold hover:text-amber-300 transition-colors"
                >
                  <Play size={16} className="text-amber-400" />
                  <span>YouTube</span>
                </a>
                <a 
                  href="https://instagram.com/smam1plg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2.5 text-xs font-bold hover:text-amber-300 transition-colors"
                >
                  <Camera size={16} className="text-amber-400" />
                  <span>Instagram</span>
                </a>
                <a 
                  href="https://tiktok.com/@smam1plg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2.5 text-xs font-bold hover:text-amber-300 transition-colors"
                >
                  <Share2 size={16} className="text-amber-400" />
                  <span>TikTok</span>
                </a>
                <a 
                  href="https://threads.net/@smam1plg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2.5 text-xs font-bold hover:text-amber-300 transition-colors"
                >
                  <Share2 size={16} className="text-amber-400" />
                  <span>Threads</span>
                </a>
              </div>
            </div>

            {/* Column 3: Contact & Support */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-4 border-amber-400 pl-2">
                Kontak Dukungan
              </h4>
              <p className="text-xs text-emerald-200/80 mb-4 font-medium">
                Hubungi staf administrasi / piket ISMUBA untuk koordinasi perizinan maupun verifikasi kelas:
              </p>
              <a 
                href="https://wa.me/628128522928" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl border border-emerald-700 text-xs font-black transition-all shadow-md active:scale-95"
              >
                <MessageCircle size={16} className="text-amber-300" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-emerald-300/70 font-semibold">
            <p>© {new Date().getFullYear()} Wakil ISMUBA SMA Muhammadiyah 1 Palembang. All Rights Reserved.</p>
            <div className="flex gap-4">
              <span>Maju Bersama, Berakhlak Mulia</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}

