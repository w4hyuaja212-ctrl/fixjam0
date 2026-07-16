import React, { useState } from 'react';
import { useStore } from '../../store';
import { saveToGAS } from '../../api';
import { formatIndonesianDate } from '../../utils';
import { Printer, X, Calendar, FileText, Check } from 'lucide-react';
import clsx from 'clsx';

export default function JadwalPage() {
  const { jadwal, setJadwal, siswa, kelas } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // local form state
  const [formData, setFormData] = useState<any>({});

  // Print configuration states
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printRange, setPrintRange] = useState<'semua' | 'bulan-ini' | 'minggu-ini' | 'kustom'>('bulan-ini');
  const [printStartDate, setPrintStartDate] = useState('');
  const [printEndDate, setPrintEndDate] = useState('');
  const [printGedung, setPrintGedung] = useState<'semua' | 'A' | 'B'>('semua');
  const [printType, setPrintType] = useState<'ringkasan' | 'detail'>('ringkasan');
  const [printShowSignature, setPrintShowSignature] = useState(true);
  const [printRole1, setPrintRole1] = useState('Wakil Bidang ISMUBA');
  const [printName1, setPrintName1] = useState('M. Basit Assirri, S.Pd.I.');
  const [printRole2, setPrintRole2] = useState('Kepala,');
  const [printName2, setPrintName2] = useState('Muhammad Bustomi, M.Pd.I.');

  const getFilteredPrintJadwal = () => {
    let list = [...jadwal];
    
    // Sort by date ascending for printing
    list.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    if (printRange === 'bulan-ini') {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const prefix = `${yr}-${mo}`;
      list = list.filter(j => j.tanggal.startsWith(prefix));
    } else if (printRange === 'minggu-ini') {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay()); // start of week (Sunday)
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // end of week (Saturday)
      
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      
      list = list.filter(j => j.tanggal >= startStr && j.tanggal <= endStr);
    } else if (printRange === 'kustom') {
      if (printStartDate) {
        list = list.filter(j => j.tanggal >= printStartDate);
      }
      if (printEndDate) {
        list = list.filter(j => j.tanggal <= printEndDate);
      }
    }

    return list;
  };

  const toggleClassInString = (currentValue: string, className: string) => {
    const classes = currentValue
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
    
    const index = classes.indexOf(className);
    if (index > -1) {
      classes.splice(index, 1);
    } else {
      classes.push(className);
    }
    return classes.join(', ');
  };

  const renderClassPills = (currentValue: string, onChange: (newVal: string) => void, filterGedung?: 'A' | 'B') => {
    const currentClasses = currentValue
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const availableKelas = filterGedung ? kelas.filter(k => k.gedung === filterGedung) : kelas;

    if (availableKelas.length === 0) return null;

    return (
      <div className="mt-1.5 p-2 bg-gray-50 rounded-lg border border-gray-100 max-h-24 overflow-y-auto">
        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-wider">Klik untuk tambah/hapus kelas:</p>
        <div className="flex flex-wrap gap-1">
          {availableKelas.map(k => {
            const isSelected = currentClasses.includes(k.name);
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => {
                  const newValue = toggleClassInString(currentValue, k.name);
                  onChange(newValue);
                }}
                className={clsx(
                  "px-2 py-0.5 rounded text-[11px] font-bold border transition-all cursor-pointer",
                  isSelected 
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {k.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleSave = async () => {
    setSaving(true);
    const id = editingId === '' ? undefined : editingId;
    const res = await saveToGAS('saveJadwal', formData, id || undefined);
    if (res && res.status === 'success') {
      const newId = id || res.id || Date.now().toString();
      if (id) {
        setJadwal(jadwal.map((j) => j.id === id ? { ...formData, id } : j));
      } else {
        setJadwal([...jadwal, { ...formData, id: newId }]);
      }
      setEditingId(null);
      alert('Jadwal berhasil disimpan');
    } else {
      alert('Gagal menyimpan jadwal (Silahkan update Apps Script Anda)');
      const newId = id || Date.now().toString();
      if (id) {
        setJadwal(jadwal.map((j) => j.id === id ? { ...formData, id } : j));
      } else {
        setJadwal([...jadwal, { ...formData, id: newId }]);
      }
      setEditingId(null);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Screen view content (hidden in print) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Jadwal Harian</h3>
            <p className="text-sm text-gray-500">Atur jadwal Jam Ke-0 dan Petugas Dzuhur.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowPrintModal(true)} 
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Printer size={16} />
              Cetak Jadwal
            </button>
            <button onClick={() => {
              const d = new Date();
              const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              setEditingId('');
              setFormData({
                tanggal: localToday,
                jamKe0GedungA: '', jamKe0GedungB: '', dzuhurGedungA: '', dzuhurGedungB: '',
                kultumGedungA: '', kultumGedungB: '',
                cadanganKultumGedungA: '', cadanganKultumGedungB: '',
                azanGedungA: '', azanGedungB: '',
                tadarusGedungA: '', tadarusGedungB: ''
              });
            }} className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
              + Tambah Jadwal
            </button>
          </div>
        </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-semibold">Tanggal</th>
              <th className="px-6 py-3 font-semibold">Jam Ke-0 (A)</th>
              <th className="px-6 py-3 font-semibold">Jam Ke-0 (B)</th>
              <th className="px-6 py-3 font-semibold">Dzuhur (A)</th>
              <th className="px-6 py-3 font-semibold">Dzuhur (B)</th>
              <th className="px-6 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jadwal.map((j) => (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-800">{j.tanggal}</td>
                <td className="px-6 py-4">{j.jamKe0GedungA}</td>
                <td className="px-6 py-4">{j.jamKe0GedungB}</td>
                <td className="px-6 py-4">{j.dzuhurGedungA}</td>
                <td className="px-6 py-4">{j.dzuhurGedungB}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleEdit(j)}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                  >
                    Edit Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">Edit Jadwal: {formData.tanggal}</h3>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Tanggal Input */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Jadwal</label>
                <input type="date" className="w-full sm:w-1/3 border-gray-300 rounded-md shadow-sm p-2 border" value={formData.tanggal || ''} onChange={e => setFormData({...formData, tanggal: e.target.value})} />
              </div>

              {/* Gedung A */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-800 mb-4">Gedung A</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Ke-0 (Kelas)</label>
                    <input type="text" list="kelasList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800" value={formData.jamKe0GedungA || ''} onChange={e => setFormData({...formData, jamKe0GedungA: e.target.value})} />
                    {renderClassPills(formData.jamKe0GedungA || '', (val) => setFormData({...formData, jamKe0GedungA: val}), 'A')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peserta Dzuhur (Kelas)</label>
                    <input type="text" list="kelasList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800" value={formData.dzuhurGedungA || ''} onChange={e => setFormData({...formData, dzuhurGedungA: e.target.value})} />
                    {renderClassPills(formData.dzuhurGedungA || '', (val) => setFormData({...formData, dzuhurGedungA: val}), 'A')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Petugas Kultum</label>
                    <input type="text" list="siswaList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none" value={formData.kultumGedungA || ''} onChange={e => setFormData({...formData, kultumGedungA: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Petugas Kultum Cadangan</label>
                    <input type="text" list="siswaList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none" value={formData.cadanganKultumGedungA || ''} onChange={e => setFormData({...formData, cadanganKultumGedungA: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Petugas Azan</label>
                    <input type="text" list="siswaList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none" value={formData.azanGedungA || ''} onChange={e => setFormData({...formData, azanGedungA: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tadarus / Piket Simpatik</label>
                    <input type="text" list="siswaList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none" value={formData.tadarusGedungA || ''} onChange={e => setFormData({...formData, tadarusGedungA: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Gedung B */}
              <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                <h4 className="font-bold text-teal-800 mb-4">Gedung B</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Ke-0 (Kelas)</label>
                    <input type="text" list="kelasList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800" value={formData.jamKe0GedungB || ''} onChange={e => setFormData({...formData, jamKe0GedungB: e.target.value})} />
                    {renderClassPills(formData.jamKe0GedungB || '', (val) => setFormData({...formData, jamKe0GedungB: val}), 'B')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peserta Dzuhur (Kelas)</label>
                    <input type="text" list="kelasList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800" value={formData.dzuhurGedungB || ''} onChange={e => setFormData({...formData, dzuhurGedungB: e.target.value})} />
                    {renderClassPills(formData.dzuhurGedungB || '', (val) => setFormData({...formData, dzuhurGedungB: val}), 'B')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Petugas Kultum</label>
                    <input type="text" list="siswaList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none" value={formData.kultumGedungB || ''} onChange={e => setFormData({...formData, kultumGedungB: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Petugas Kultum Cadangan</label>
                    <input type="text" list="siswaList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none" value={formData.cadanganKultumGedungB || ''} onChange={e => setFormData({...formData, cadanganKultumGedungB: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Petugas Azan</label>
                    <input type="text" list="siswaList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none" value={formData.azanGedungB || ''} onChange={e => setFormData({...formData, azanGedungB: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tadarus / Piket Simpatik</label>
                    <input type="text" list="siswaList" className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none" value={formData.tadarusGedungB || ''} onChange={e => setFormData({...formData, tadarusGedungB: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
              <button disabled={saving} onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Datalists for autocompletion */}
      <datalist id="siswaList">
        {siswa.map(s => (
          <option key={s.id} value={s.name} />
        ))}
      </datalist>

      <datalist id="kelasList">
        {kelas.map(k => (
          <option key={k.id} value={k.name} />
        ))}
      </datalist>
      </div>

      {/* ----------------- PRINT SETUP MODAL (SCREEN ONLY) ----------------- */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden transition-all duration-300">
          <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col md:flex-row">
            
            {/* Left side: Controls (40%) */}
            <div className="w-full md:w-5/12 p-6 overflow-y-auto border-r border-gray-200 bg-white flex flex-col gap-5">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Printer className="text-emerald-600" size={20} />
                    Pengaturan Cetak
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Kustomisasi format dokumen cetak / PDF</p>
                </div>
                <button 
                  onClick={() => setShowPrintModal(false)} 
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filter Tanggal */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">Rentang Jadwal</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'semua', label: 'Semua Data' },
                    { id: 'bulan-ini', label: 'Bulan Ini' },
                    { id: 'minggu-ini', label: 'Pekan Ini' },
                    { id: 'kustom', label: 'Rentang Kustom' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPrintRange(opt.id as any)}
                      className={clsx(
                        "p-2 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer",
                        printRange === opt.id 
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {printRange === 'kustom' && (
                  <div className="grid grid-cols-2 gap-2 pt-2 animate-fade-in">
                    <div>
                      <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Tanggal Mulai</span>
                      <input 
                        type="date" 
                        value={printStartDate} 
                        onChange={e => setPrintStartDate(e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Tanggal Akhir</span>
                      <input 
                        type="date" 
                        value={printEndDate} 
                        onChange={e => setPrintEndDate(e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Gedung */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">Pilihan Gedung</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'semua', label: 'Semua' },
                    { id: 'A', label: 'Gedung A' },
                    { id: 'B', label: 'Gedung B' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPrintGedung(opt.id as any)}
                      className={clsx(
                        "p-2 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer",
                        printGedung === opt.id 
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" 
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipe Cetak */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">Format Tampilan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintType('ringkasan')}
                    className={clsx(
                      "p-2 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer",
                      printType === 'ringkasan' 
                        ? "bg-amber-600 border-amber-600 text-white shadow-sm" 
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    Ringkasan Utama
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintType('detail')}
                    className={clsx(
                      "p-2 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer",
                      printType === 'detail' 
                        ? "bg-amber-600 border-amber-600 text-white shadow-sm" 
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    Lengkap & Detail
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Ringkasan hanya memuat Jam Ke-0 dan Dzuhur. Lengkap memuat Azan, Kultum, dan Tadarus.</p>
              </div>

              {/* Pengaturan Tanda Tangan */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Kolom Pengesahan</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={printShowSignature}
                      onChange={e => setPrintShowSignature(e.target.checked)}
                    />
                    <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {printShowSignature && (
                  <div className="space-y-3 pt-2 border-t border-gray-200 text-xs animate-fade-in">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block mb-0.5 uppercase">Pihak Kiri (Pemberi Jadwal)</span>
                      <input 
                        type="text" 
                        placeholder="Jabatan" 
                        className="w-full text-xs border border-gray-300 rounded p-1 mb-1 font-medium focus:ring-1 focus:ring-blue-500 outline-none" 
                        value={printRole1} 
                        onChange={e => setPrintRole1(e.target.value)} 
                      />
                      <input 
                        type="text" 
                        placeholder="Nama Lengkap & Gelar" 
                        className="w-full text-xs border border-gray-300 rounded p-1 font-bold focus:ring-1 focus:ring-blue-500 outline-none" 
                        value={printName1} 
                        onChange={e => setPrintName1(e.target.value)} 
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block mb-0.5 uppercase">Pihak Kanan (Penyetuju)</span>
                      <input 
                        type="text" 
                        placeholder="Jabatan" 
                        className="w-full text-xs border border-gray-300 rounded p-1 mb-1 font-medium focus:ring-1 focus:ring-blue-500 outline-none" 
                        value={printRole2} 
                        onChange={e => setPrintRole2(e.target.value)} 
                      />
                      <input 
                        type="text" 
                        placeholder="Nama Lengkap & Gelar" 
                        className="w-full text-xs border border-gray-300 rounded p-1 font-bold focus:ring-1 focus:ring-blue-500 outline-none" 
                        value={printName2} 
                        onChange={e => setPrintName2(e.target.value)} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-100 mt-auto">
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-md shadow-blue-500/10"
                >
                  <Printer size={14} />
                  Cetak Sekarang
                </button>
              </div>
            </div>

            {/* Right side: Live Preview Mock-up (60%) */}
            <div className="flex-1 bg-gray-500/15 p-6 overflow-y-auto flex justify-center items-start min-h-[300px] md:min-h-0">
              <div className="bg-white rounded-md shadow-lg border border-gray-300 p-8 w-full max-w-[215mm] text-[10px] text-black font-sans leading-relaxed relative min-h-[297mm]">
                
                {/* Visual indicator of F4 paper */}
                <div className="absolute top-2 right-2 bg-neutral-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase opacity-40 select-none">
                  Simulasi Kertas F4 (Lanskap/Potret)
                </div>

                {/* Kop Surat Header */}
                <div className="border-b-2 border-black pb-3 mb-4 text-center">
                  <h4 className="text-[10px] font-bold tracking-wide uppercase leading-tight">PIMPINAN CABANG MUHAMMADIYAH PALEMBANG I</h4>
                  <h3 className="text-sm font-black tracking-wider uppercase mt-0.5 text-blue-900 leading-tight">SMA MUHAMMADIYAH 1 PALEMBANG</h3>
                  <p className="text-[8px] text-gray-700 font-medium leading-none mt-1">
                    Status Terakreditasi "A" - NSS : 302116001010 - NDS : L. 01024001
                  </p>
                  <p className="text-[7.5px] text-gray-500 font-medium leading-none mt-0.5">
                    Alamat: Jl. Jend. Sudirman Km. 4,5 Balayudha Kec. Kemuning Palembang, Telp: (0711) 351478
                  </p>
                </div>

                {/* Document Title */}
                <div className="text-center mb-4">
                  <h4 className="text-[10px] font-black tracking-wide uppercase underline">
                    JADWAL KEGIATAN ISMUBA DAN HARI EFEKTIF SEKOLAH
                  </h4>
                  <p className="text-[8px] text-gray-700 font-bold mt-0.5 uppercase tracking-wide">
                    {printRange === 'semua' && 'Semua Periode Terdata'}
                    {printRange === 'bulan-ini' && `Periode Bulan: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`}
                    {printRange === 'minggu-ini' && 'Periode Pekan Ini'}
                    {printRange === 'kustom' && `Periode: ${printStartDate || 'Awal'} s.d ${printEndDate || 'Akhir'}`}
                  </p>
                </div>

                {/* Live Preview Table */}
                {getFilteredPrintJadwal().length === 0 ? (
                  <div className="border border-dashed border-gray-300 p-8 text-center text-gray-400 font-medium rounded-lg">
                    Tidak ada jadwal yang cocok dengan filter tanggal di atas.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-black text-[8px] leading-tight text-black">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black p-1 font-bold text-center w-5">No</th>
                          <th className="border border-black p-1 font-bold text-center w-28">Hari, Tanggal</th>
                          
                          {printGedung !== 'B' && (
                            <>
                              <th className="border border-black p-1 font-bold text-center bg-green-50/50">
                                {printGedung === 'A' ? 'Jam Ke-0' : 'Jam Ke-0 (Gedung A)'}
                              </th>
                              <th className="border border-black p-1 font-bold text-center bg-green-50/50">
                                {printGedung === 'A' ? 'Dzuhur' : 'Dzuhur (Gedung A)'}
                              </th>
                              {printType === 'detail' && (
                                <>
                                  <th className="border border-black p-1 font-bold text-center bg-green-50/50">Kultum (A)</th>
                                  <th className="border border-black p-1 font-bold text-center bg-green-50/50">Azan (A)</th>
                                  <th className="border border-black p-1 font-bold text-center bg-green-50/50">Tadarus (A)</th>
                                </>
                              )}
                            </>
                          )}

                          {printGedung !== 'A' && (
                            <>
                              <th className="border border-black p-1 font-bold text-center bg-teal-50/50">
                                {printGedung === 'B' ? 'Jam Ke-0' : 'Jam Ke-0 (Gedung B)'}
                              </th>
                              <th className="border border-black p-1 font-bold text-center bg-teal-50/50">
                                {printGedung === 'B' ? 'Dzuhur' : 'Dzuhur (Gedung B)'}
                              </th>
                              {printType === 'detail' && (
                                <>
                                  <th className="border border-black p-1 font-bold text-center bg-teal-50/50">Kultum (B)</th>
                                  <th className="border border-black p-1 font-bold text-center bg-teal-50/50">Azan (B)</th>
                                  <th className="border border-black p-1 font-bold text-center bg-teal-50/50">Tadarus (B)</th>
                                </>
                              )}
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredPrintJadwal().map((j, index) => (
                          <tr key={j.id} className="hover:bg-gray-50">
                            <td className="border border-black p-1 text-center">{index + 1}</td>
                            <td className="border border-black p-1 font-bold">
                              {formatIndonesianDate(j.tanggal)}
                            </td>

                            {printGedung !== 'B' && (
                              <>
                                <td className="border border-black p-1 text-center font-semibold text-green-900 bg-green-50/20">{j.jamKe0GedungA || '-'}</td>
                                <td className="border border-black p-1 text-center text-green-800 bg-green-50/20">{j.dzuhurGedungA || '-'}</td>
                                {printType === 'detail' && (
                                  <>
                                    <td className="border border-black p-1 text-center text-green-800 bg-green-50/20">
                                      <div>{j.kultumGedungA || '-'}</div>
                                      {j.cadanganKultumGedungA && (
                                        <div className="text-[6.5px] text-gray-500 italic font-medium leading-none mt-0.5">
                                          Cad: {j.cadanganKultumGedungA}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border border-black p-1 text-center text-green-800 bg-green-50/20">{j.azanGedungA || '-'}</td>
                                    <td className="border border-black p-1 text-center text-green-800 bg-green-50/20">{j.tadarusGedungA || '-'}</td>
                                  </>
                                )}
                              </>
                            )}

                            {printGedung !== 'A' && (
                              <>
                                <td className="border border-black p-1 text-center font-semibold text-teal-900 bg-teal-50/20">{j.jamKe0GedungB || '-'}</td>
                                <td className="border border-black p-1 text-center text-teal-800 bg-teal-50/20">{j.dzuhurGedungB || '-'}</td>
                                {printType === 'detail' && (
                                  <>
                                    <td className="border border-black p-1 text-center text-teal-800 bg-teal-50/20">
                                      <div>{j.kultumGedungB || '-'}</div>
                                      {j.cadanganKultumGedungB && (
                                        <div className="text-[6.5px] text-gray-500 italic font-medium leading-none mt-0.5">
                                          Cad: {j.cadanganKultumGedungB}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border border-black p-1 text-center text-teal-800 bg-teal-50/20">{j.azanGedungB || '-'}</td>
                                    <td className="border border-black p-1 text-center text-teal-800 bg-teal-50/20">{j.tadarusGedungB || '-'}</td>
                                  </>
                                )}
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Signature Live Preview */}
                {printShowSignature && (
                  <div className="mt-8 flex justify-between items-start text-[8px] leading-tight px-4 select-none">
                    <div className="text-center w-40">
                      <p>&nbsp;</p>
                      <p className="font-bold">{printRole1 || 'Wakil ISMUBA'}</p>
                      <div className="h-10 border-b border-dashed border-gray-300 mb-1"></div>
                      <p className="font-bold underline">{printName1 || 'Nama Pejabat'}</p>
                      <p className="text-[7px] text-gray-500">NBM 1200703</p>
                    </div>

                    <div className="text-center w-40">
                      <p>Palembang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="font-bold">{printRole2 || 'Kepala,'}</p>
                      <div className="h-10 border-b border-dashed border-gray-300 mb-1"></div>
                      <p className="font-bold underline">{printName2 || 'Nama Pejabat'}</p>
                      <p className="text-[7px] text-gray-500">NBM 1135403</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- HARDCOPY PRINT LAYOUT (VISIBLE ONLY TO PRINTER) ----------------- */}
      <div className="hidden print:block w-full text-black font-sans text-xs p-2">
        {/* Kop Surat / Official School Header */}
        <div className="border-b-4 border-double border-black pb-4 mb-6 text-center">
          <h2 className="text-xs font-bold tracking-wide uppercase leading-tight">PIMPINAN CABANG MUHAMMADIYAH PALEMBANG I</h2>
          <h1 className="text-base font-black tracking-wider uppercase mt-1 leading-tight">SMA MUHAMMADIYAH 1 PALEMBANG</h1>
          <p className="text-[9px] text-gray-700 font-medium leading-none mt-1">
            Status Terakreditasi "A" - NSS : 302116001010 - NDS : L. 01024001
          </p>
          <p className="text-[8px] text-gray-500 font-medium leading-none mt-0.5">
            Alamat: Jl. Jend. Sudirman Km. 4,5 Balayudha Kec. Kemuning Palembang, Telp: (0711) 351478
          </p>
        </div>

        {/* Title of Document */}
        <div className="text-center mb-6">
          <h2 className="text-sm font-black tracking-wide uppercase underline leading-tight">
            JADWAL KEGIATAN ISMUBA DAN HARI EFEKTIF SEKOLAH
          </h2>
          <p className="text-[10px] text-gray-700 font-bold mt-1 uppercase tracking-wide">
            {printRange === 'semua' && 'Semua Periode Terdata'}
            {printRange === 'bulan-ini' && `Periode Bulan: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`}
            {printRange === 'minggu-ini' && 'Periode Pekan Ini'}
            {printRange === 'kustom' && `Periode: ${printStartDate || 'Awal'} s.d ${printEndDate || 'Akhir'}`}
          </p>
        </div>

        {/* Main Schedule Table for Printing */}
        {getFilteredPrintJadwal().length === 0 ? (
          <p className="text-center text-sm font-bold my-12 border border-gray-300 p-4 rounded">
            Tidak ada jadwal untuk kriteria filter yang dipilih.
          </p>
        ) : (
          <table className="w-full border-collapse border border-black text-[10px] leading-tight text-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-2 py-1.5 font-bold text-center w-8">No</th>
                <th className="border border-black px-2 py-1.5 font-bold text-center w-44">Hari / Tanggal</th>
                
                {printGedung !== 'B' && (
                  <>
                    <th className="border border-black px-2 py-1.5 font-bold text-center">
                      {printGedung === 'A' ? 'Jam Ke-0' : 'Jam Ke-0 (Gedung A)'}
                    </th>
                    <th className="border border-black px-2 py-1.5 font-bold text-center">
                      {printGedung === 'A' ? 'Dzuhur' : 'Dzuhur (Gedung A)'}
                    </th>
                    {printType === 'detail' && (
                      <>
                        <th className="border border-black px-2 py-1.5 font-bold text-center">Kultum (A)</th>
                        <th className="border border-black px-2 py-1.5 font-bold text-center">Azan (A)</th>
                        <th className="border border-black px-2 py-1.5 font-bold text-center">Tadarus (A)</th>
                      </>
                    )}
                  </>
                )}

                {printGedung !== 'A' && (
                  <>
                    <th className="border border-black px-2 py-1.5 font-bold text-center">
                      {printGedung === 'B' ? 'Jam Ke-0' : 'Jam Ke-0 (Gedung B)'}
                    </th>
                    <th className="border border-black px-2 py-1.5 font-bold text-center">
                      {printGedung === 'B' ? 'Dzuhur' : 'Dzuhur (Gedung B)'}
                    </th>
                    {printType === 'detail' && (
                      <>
                        <th className="border border-black px-2 py-1.5 font-bold text-center">Kultum (B)</th>
                        <th className="border border-black px-2 py-1.5 font-bold text-center">Azan (B)</th>
                        <th className="border border-black px-2 py-1.5 font-bold text-center">Tadarus (B)</th>
                      </>
                    )}
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {getFilteredPrintJadwal().map((j, idx) => (
                <tr key={j.id} className="page-break-inside-avoid">
                  <td className="border border-black px-2 py-1.5 text-center">{idx + 1}</td>
                  <td className="border border-black px-2 py-1.5 font-bold">
                    {formatIndonesianDate(j.tanggal)}
                  </td>

                  {printGedung !== 'B' && (
                    <>
                      <td className="border border-black px-2 py-1.5 text-center font-semibold">{j.jamKe0GedungA || '-'}</td>
                      <td className="border border-black px-2 py-1.5 text-center">{j.dzuhurGedungA || '-'}</td>
                      {printType === 'detail' && (
                        <>
                          <td className="border border-black px-2 py-1.5 text-center">
                            <div>{j.kultumGedungA || '-'}</div>
                            {j.cadanganKultumGedungA && (
                              <div className="text-[8px] text-gray-500 italic font-medium leading-none mt-0.5">
                                Cad: {j.cadanganKultumGedungA}
                              </div>
                            )}
                          </td>
                          <td className="border border-black px-2 py-1.5 text-center">{j.azanGedungA || '-'}</td>
                          <td className="border border-black px-2 py-1.5 text-center">{j.tadarusGedungA || '-'}</td>
                        </>
                      )}
                    </>
                  )}

                  {printGedung !== 'A' && (
                    <>
                      <td className="border border-black px-2 py-1.5 text-center font-semibold">{j.jamKe0GedungB || '-'}</td>
                      <td className="border border-black px-2 py-1.5 text-center">{j.dzuhurGedungB || '-'}</td>
                      {printType === 'detail' && (
                        <>
                          <td className="border border-black px-2 py-1.5 text-center">
                            <div>{j.kultumGedungB || '-'}</div>
                            {j.cadanganKultumGedungB && (
                              <div className="text-[8px] text-gray-500 italic font-medium leading-none mt-0.5">
                                Cad: {j.cadanganKultumGedungB}
                              </div>
                            )}
                          </td>
                          <td className="border border-black px-2 py-1.5 text-center">{j.azanGedungB || '-'}</td>
                          <td className="border border-black px-2 py-1.5 text-center">{j.tadarusGedungB || '-'}</td>
                        </>
                      )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Signature Endorsement block */}
        {printShowSignature && (
          <div className="mt-12 flex justify-between items-start text-[11px] leading-snug px-6 page-break-inside-avoid">
            {/* Left Signatory */}
            <div className="text-center w-64">
              <p>&nbsp;</p>
              <p className="font-bold">{printRole1}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{printName1}</p>
              <p className="text-[10px] text-gray-700">NBM 1200703</p>
            </div>

            {/* Right Signatory */}
            <div className="text-center w-64">
              <p>Palembang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold">{printRole2}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{printName2}</p>
              <p className="text-[10px] text-gray-700">NBM 1135403</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
