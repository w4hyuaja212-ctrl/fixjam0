import React, { useState } from 'react';
import { useStore } from '../../store';
import { Check, X } from 'lucide-react';
import { saveToGAS } from '../../api';

export default function TahunAjaranPage() {
  const { tahunAjaran, setTahunAjaran } = useStore();
  const [savingId, setSavingId] = useState<string | null>(null);

  // New states for adding academic year
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIsActive, setNewIsActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleToggleActive = async (id: string) => {
    setSavingId(id);
    const target = tahunAjaran.find(t => t.id === id);
    if (target) {
      const updatedData = { ...target, isActive: true };
      
      const res = await saveToGAS('saveTahunAjaran', updatedData, target.id);
      
      // Also need to set others to false, but let's keep it simple for now
      // by optimistic local state update
      const newData = tahunAjaran.map(ta => ({
        ...ta,
        isActive: ta.id === id ? true : false
      }));
      setTahunAjaran(newData);
      
      if (!res || res.status !== 'success') {
        alert('Data disimpan lokal. (Update Apps Script diperlukan untuk DB)');
      }
    }
    setSavingId(null);
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    
    const data = {
      name: newName.trim(),
      isActive: newIsActive
    };

    const res = await saveToGAS('saveTahunAjaran', data);
    
    let updatedList = [...tahunAjaran];
    if (newIsActive) {
      updatedList = updatedList.map(ta => ({ ...ta, isActive: false }));
    }

    const newId = (res && res.status === 'success' && res.id) ? String(res.id) : Date.now().toString();
    setTahunAjaran([...updatedList, { ...data, id: newId }]);
    
    setIsAdding(false);
    setNewName('');
    setNewIsActive(false);
    setSaving(false);
    
    if (res && res.status === 'success') {
      alert('Tahun Ajaran baru berhasil ditambahkan!');
    } else {
      alert('Data disimpan lokal sementara (silahkan deploy Apps Script yang benar)');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Tahun Ajaran</h3>
        <button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Tambah Tahun
        </button>
      </div>
      
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 font-semibold">Tahun Ajaran</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tahunAjaran.map(ta => (
            <tr key={ta.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{ta.name}</td>
              <td className="px-6 py-4">
                {ta.isActive ? (
                  <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800 font-bold">
                    <Check size={14} /> Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <X size={14} /> Tidak Aktif
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {!ta.isActive && (
                  <button 
                    disabled={savingId === ta.id}
                    onClick={() => handleToggleActive(ta.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50"
                  >
                    {savingId === ta.id ? 'Memproses...' : 'Set Aktif'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveNew} className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Tambah Tahun Ajaran</h3>
              <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tahun Ajaran</label>
                <input 
                  required 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  type="text" 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Contoh: 2026/2027" 
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  id="isActiveCheck"
                  type="checkbox" 
                  checked={newIsActive} 
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" 
                />
                <label htmlFor="isActiveCheck" className="text-sm font-medium text-gray-700 cursor-pointer select-none">Set sebagai Aktif</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg">Batal</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
