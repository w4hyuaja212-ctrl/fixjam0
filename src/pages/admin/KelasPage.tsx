import React, { useState } from 'react';
import { useStore } from '../../store';
import { saveToGAS } from '../../api';

export default function KelasPage() {
  const { kelas, setKelas } = useStore();
  const [editingKelas, setEditingKelas] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      waliKelas: formData.get('waliKelas') as string,
      gedung: formData.get('gedung') as 'A' | 'B',
    };
    
    const id = editingKelas?.id;
    const res = await saveToGAS('saveKelas', data, id);
    
    if (res && res.status === 'success') {
      const newId = id || res.id || Date.now().toString();
      if (id) {
        setKelas(kelas.map(k => k.id === id ? { ...data, id } : k));
      } else {
        setKelas([...kelas, { ...data, id: newId }]);
      }
    } else {
      alert('Data disimpan lokal. (Update Apps Script diperlukan)');
      const newId = id || Date.now().toString();
      if (id) {
        setKelas(kelas.map(k => k.id === id ? { ...data, id } : k));
      } else {
        setKelas([...kelas, { ...data, id: newId }]);
      }
    }
    
    setEditingKelas(null);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Management Kelas</h3>
          <p className="text-sm text-gray-500">Daftar kelas beserta wali kelas dan lokasi gedung.</p>
        </div>
        <button onClick={() => setEditingKelas({})} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Tambah Kelas
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama Kelas</th>
              <th className="px-6 py-4 font-semibold">Wali Kelas</th>
              <th className="px-6 py-4 font-semibold">Gedung</th>
              <th className="px-6 py-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {kelas.map(k => (
              <tr key={k.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{k.name}</td>
                <td className="px-6 py-4">{k.waliKelas}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-bold text-xs">
                    {k.gedung}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => setEditingKelas(k)} className="text-gray-500 hover:text-blue-600 font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingKelas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{editingKelas.id ? 'Edit Kelas' : 'Tambah Kelas'}</h3>
              <button type="button" onClick={() => setEditingKelas(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
                <input required name="name" defaultValue={editingKelas.name} type="text" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Contoh: X-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Wali Kelas</label>
                <input required name="waliKelas" defaultValue={editingKelas.waliKelas} type="text" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gedung</label>
                <select required name="gedung" defaultValue={editingKelas.gedung || 'A'} className="w-full border-gray-300 rounded-md shadow-sm p-2 border">
                  <option value="A">Gedung A</option>
                  <option value="B">Gedung B</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setEditingKelas(null)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg">Batal</button>
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
