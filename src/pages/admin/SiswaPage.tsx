import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { saveToGAS } from '../../api';
import { findKelas } from '../../utils';
import * as XLSX from 'xlsx';
import clsx from 'clsx';

export default function SiswaPage() {
  const { siswa, kelas, setSiswa } = useStore();
  const [editingSiswa, setEditingSiswa] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [importingExcel, setImportingExcel] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      nis: formData.get('nis') as string,
      name: formData.get('name') as string,
      kelasId: formData.get('kelasId') as string,
    };
    
    const id = editingSiswa?.id;
    const res = await saveToGAS('saveSiswa', data, id);
    
    if (res && res.status === 'success') {
      const newId = id || res.id || Date.now().toString();
      if (id) {
        setSiswa(siswa.map(s => s.id === id ? { ...data, id } : s));
      } else {
        setSiswa([...siswa, { ...data, id: newId }]);
      }
    } else {
      alert('Data disimpan lokal. (Update Apps Script diperlukan untuk DB)');
      const newId = id || Date.now().toString();
      if (id) {
        setSiswa(siswa.map(s => s.id === id ? { ...data, id } : s));
      } else {
        setSiswa([...siswa, { ...data, id: newId }]);
      }
    }
    
    setEditingSiswa(null);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus?')) return;
    const res = await saveToGAS('deleteSiswa', {}, id);
    if (!res || res.status !== 'success') {
      alert('Dihapus dari lokal saja (Update Apps Script diperlukan)');
    }
    setSiswa(siswa.filter(s => s.id !== id));
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingExcel(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (rawData.length <= 1) {
          alert('File Excel kosong atau tidak memiliki header.');
          setImportingExcel(false);
          return;
        }

        const headers = rawData[0].map(h => String(h || '').trim().toLowerCase());
        const rows = rawData.slice(1).filter(r => r && r.length > 0 && String(r[0] || '').trim() !== '');

        // Find column indexes
        const nisIdx = headers.findIndex(h => h.includes('nis') || h.includes('nomor induk') || h.includes('id') || h === 'nis');
        const nameIdx = headers.findIndex(h => h.includes('nama') || h.includes('name') || h === 'nama');
        const kelasIdx = headers.findIndex(h => h.includes('kelas') || h.includes('class') || h.includes('rombel') || h === 'kelas');

        if (nisIdx === -1 || nameIdx === -1) {
          alert('Format Excel salah. Kolom harus berisi minimal header "NIS" dan "Nama".');
          setImportingExcel(false);
          return;
        }

        setImportProgress({ current: 0, total: rows.length });
        let importedCount = 0;
        const newSiswaList = [...siswa];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const nisValue = String(row[nisIdx] || '').trim();
          const nameValue = String(row[nameIdx] || '').trim();
          
          if (!nisValue || !nameValue) continue;

          let matchedKelasId = '';
          if (kelasIdx !== -1 && row[kelasIdx]) {
            const classNameInput = String(row[kelasIdx]).trim();
            const foundKelas = findKelas(kelas, classNameInput);
            if (foundKelas) {
              matchedKelasId = foundKelas.id;
            } else {
              matchedKelasId = classNameInput; // Simpan teks asli jika kelas tidak ditemukan agar tetap ter-render
            }
          }

          const existingIdx = newSiswaList.findIndex(s => s.nis === nisValue);
          const siswaData = {
            nis: nisValue,
            name: nameValue,
            kelasId: matchedKelasId,
          };

          const res = await saveToGAS('saveSiswa', siswaData, existingIdx !== -1 ? newSiswaList[existingIdx].id : undefined);
          
          const savedId = (res && res.status === 'success' && res.id) ? String(res.id) : String(Date.now() + i);
          
          if (existingIdx !== -1) {
            newSiswaList[existingIdx] = { ...siswaData, id: newSiswaList[existingIdx].id };
          } else {
            newSiswaList.push({ ...siswaData, id: savedId });
          }
          
          importedCount++;
          setImportProgress({ current: i + 1, total: rows.length });
        }

        setSiswa(newSiswaList);
        alert(`Berhasil mengimpor ${importedCount} data siswa dari Excel!`);
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file Excel. Pastikan file dalam format .xlsx atau .xls murni.');
      } finally {
        setImportingExcel(false);
        setImportProgress({ current: 0, total: 0 });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Data Siswa</h3>
          <p className="text-sm text-gray-500">Kelola data siswa dan pemetaan kelas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm">
            <span>📥 Import Excel</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              onChange={handleExcelImport}
              disabled={importingExcel}
            />
          </label>
          <button onClick={() => setEditingSiswa({})} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            + Tambah Siswa
          </button>
        </div>
      </div>

      {importingExcel && (
        <div className="bg-blue-50 border-y border-blue-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium text-blue-800">
              Sedang memproses & menyimpan data ke database Google Sheets ({importProgress.current} / {importProgress.total})...
            </span>
          </div>
          <div className="w-full sm:w-1/3 bg-blue-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${(importProgress.current / (importProgress.total || 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">NIS</th>
              <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
              <th className="px-6 py-4 font-semibold">Kelas</th>
              <th className="px-6 py-4 font-semibold">Gedung</th>
              <th className="px-6 py-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {siswa.map(s => {
              const k = findKelas(kelas, s.kelasId);
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500 font-mono">{s.nis}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{s.name}</td>
                  <td className="px-6 py-4 font-medium">{k ? k.name : <span className="text-gray-450 italic font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{s.kelasId || 'Belum diset'}</span>}</td>
                  <td className="px-6 py-4">
                    {k ? (
                      <span className={clsx(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold",
                        k.gedung === 'A' ? "bg-emerald-100 text-emerald-800" : "bg-teal-100 text-teal-800"
                      )}>
                        Gedung {k.gedung}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button onClick={() => setEditingSiswa(s)} className="text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 font-semibold">Hapus</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingSiswa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{editingSiswa.id ? 'Edit Siswa' : 'Tambah Siswa'}</h3>
              <button type="button" onClick={() => setEditingSiswa(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                <input required name="nis" defaultValue={editingSiswa.nis} type="text" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input required name="name" defaultValue={editingSiswa.name} type="text" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                <select 
                  required 
                  name="kelasId" 
                  defaultValue={(() => {
                    if (!editingSiswa.kelasId) return '';
                    const found = findKelas(kelas, editingSiswa.kelasId);
                    return found ? found.id : editingSiswa.kelasId;
                  })()} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                >
                  <option value="">Pilih Kelas</option>
                  {kelas.map(k => (
                    <option key={k.id} value={k.id}>{k.name} (Gedung {k.gedung})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setEditingSiswa(null)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg">Batal</button>
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
