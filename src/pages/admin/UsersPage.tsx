import React, { useState } from 'react';
import { useStore } from '../../store';
import { saveToGAS } from '../../api';

export default function UsersPage() {
  const { users, setUsers } = useStore();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      role: formData.get('role') as 'admin' | 'piket',
    };
    
    const id = editingUser?.id;
    const res = await saveToGAS('saveUser', data, id);
    
    if (res && res.status === 'success') {
      const newId = id || res.id || Date.now().toString();
      if (id) {
        setUsers(users.map(u => u.id === id ? { ...data, id } : u));
      } else {
        setUsers([...users, { ...data, id: newId }]);
      }
    } else {
      alert('Data disimpan lokal. (Update Apps Script diperlukan)');
      const newId = id || Date.now().toString();
      if (id) {
        setUsers(users.map(u => u.id === id ? { ...data, id } : u));
      } else {
        setUsers([...users, { ...data, id: newId }]);
      }
    }
    
    setEditingUser(null);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Role & User Management</h3>
          <p className="text-sm text-gray-500">Kelola akun Admin dan Petugas Piket.</p>
        </div>
        <button onClick={() => setEditingUser({})} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Tambah Akun
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama Pengguna</th>
              <th className="px-6 py-4 font-semibold">Username</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4 text-gray-500">{u.username}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => setEditingUser(u)} className="text-gray-500 hover:text-blue-600 font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{editingUser.id ? 'Edit User' : 'Tambah User'}</h3>
              <button type="button" onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengguna</label>
                <input required name="name" defaultValue={editingUser.name} type="text" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input required name="username" defaultValue={editingUser.username} type="text" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select required name="role" defaultValue={editingUser.role || 'piket'} className="w-full border-gray-300 rounded-md shadow-sm p-2 border">
                  <option value="piket">Piket</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg">Batal</button>
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
