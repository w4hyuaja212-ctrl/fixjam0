export interface TahunAjaran {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Kelas {
  id: string;
  name: string;
  waliKelas: string;
  gedung: 'A' | 'B';
}

export interface Siswa {
  id: string;
  nis: string;
  name: string;
  kelasId: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'piket';
  name: string;
}

export interface Jadwal {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jamKe0GedungA: string; // Kelas
  jamKe0GedungB: string;
  dzuhurGedungA: string;
  dzuhurGedungB: string;
  kultumGedungA: string;
  kultumGedungB: string;
  cadanganKultumGedungA?: string;
  cadanganKultumGedungB?: string;
  azanGedungA: string;
  azanGedungB: string;
  tadarusGedungA: string;
  tadarusGedungB: string;
}
