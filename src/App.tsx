import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicDashboard from './pages/PublicDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import TahunAjaranPage from './pages/admin/TahunAjaranPage';
import KelasPage from './pages/admin/KelasPage';
import SiswaPage from './pages/admin/SiswaPage';
import JadwalPage from './pages/admin/JadwalPage';
import UsersPage from './pages/admin/UsersPage';
import DatabaseConfigPage from './pages/admin/DatabaseConfigPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicDashboard />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/jadwal" replace />} />
          <Route path="jadwal" element={<JadwalPage />} />
          <Route path="tahun-ajaran" element={<TahunAjaranPage />} />
          <Route path="kelas" element={<KelasPage />} />
          <Route path="siswa" element={<SiswaPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="database" element={<DatabaseConfigPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
