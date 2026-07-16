import { create } from 'zustand';
import { TahunAjaran, Kelas, Siswa, User, Jadwal } from './types';

interface StoreState {
  tahunAjaran: TahunAjaran[];
  kelas: Kelas[];
  siswa: Siswa[];
  users: User[];
  jadwal: Jadwal[];
  
  setTahunAjaran: (data: TahunAjaran[]) => void;
  setKelas: (data: Kelas[]) => void;
  setSiswa: (data: Siswa[]) => void;
  setUsers: (data: User[]) => void;
  setJadwal: (data: Jadwal[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  tahunAjaran: [
    { id: '1', name: '2023/2024', isActive: false },
    { id: '2', name: '2024/2025', isActive: true },
  ],
  kelas: [
    { id: '1', name: 'X-1', waliKelas: 'Budi Santoso', gedung: 'A' },
    { id: '2', name: 'XI-1', waliKelas: 'Siti Aminah', gedung: 'B' },
    { id: '3', name: 'XII-1', waliKelas: 'Ahmad Dahlan', gedung: 'A' },
  ],
  siswa: [
    { id: '1', nis: '1001', name: 'Andi Saputra', kelasId: '1' },
    { id: '2', nis: '1002', name: 'Budi Wisesa', kelasId: '2' },
  ],
  users: [
    { id: '1', username: 'admin', role: 'admin', name: 'Super Admin' },
    { id: '2', username: 'piket', role: 'piket', name: 'Petugas Piket' },
  ],
  jadwal: [
    {
      id: '1',
      tanggal: new Date().toISOString().split('T')[0],
      jamKe0GedungA: 'X-1',
      jamKe0GedungB: 'XI-1',
      dzuhurGedungA: 'X-1',
      dzuhurGedungB: 'XI-1',
      kultumGedungA: 'Andi Saputra',
      kultumGedungB: 'Budi Wisesa',
      azanGedungA: 'Siswa A',
      azanGedungB: 'Siswa B',
      tadarusGedungA: 'Siswa C',
      tadarusGedungB: 'Siswa D',
    }
  ],
  
  setTahunAjaran: (data) => set({ tahunAjaran: data }),
  setKelas: (data) => set({ kelas: data }),
  setSiswa: (data) => set({ siswa: data }),
  setUsers: (data) => set({ users: data }),
  setJadwal: (data) => set({ jadwal: data }),
}));
