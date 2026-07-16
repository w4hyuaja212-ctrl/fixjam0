export const GAS_URL = "/api/save";

export const fetchAllData = async () => {
  try {
    const res = await fetch("/api/all");
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    if (json.status === "success" && json.data) {
      const raw = json.data;
      
      // Normalize tahunAjaran
      const tahunAjaran = (raw.tahunAjaran || []).map((ta: any) => ({
        id: String(ta.id),
        name: String(ta.name || ""),
        isActive: ta.isActive === true || ta.isActive === "true" || ta.isActive === 1 || String(ta.isActive).toUpperCase() === "TRUE"
      }));

      // Normalize kelas
      const kelas = (raw.kelas || []).map((k: any) => {
        const rawGedung = String(k.gedung || "A").trim().toUpperCase();
        const normalizedGedung: 'A' | 'B' = rawGedung.includes("B") ? "B" : "A";
        return {
          id: String(k.id),
          name: String(k.name || ""),
          waliKelas: String(k.waliKelas || ""),
          gedung: normalizedGedung
        };
      });

      // Normalize siswa
      const siswa = (raw.siswa || []).map((s: any) => ({
        id: String(s.id),
        nis: String(s.nis || ""),
        name: String(s.name || ""),
        kelasId: s.kelasId ? String(s.kelasId) : ""
      }));

      // Normalize users
      const users = (raw.users || []).map((u: any) => ({
        id: String(u.id),
        username: String(u.username || ""),
        role: (u.role === "admin" ? "admin" : "piket") as 'admin' | 'piket',
        name: String(u.name || "")
      }));

      // Normalize jadwal
      const jadwal = (raw.jadwal || []).map((j: any) => {
        let cleanTanggal = String(j.tanggal || "");
        if (cleanTanggal.includes("T")) {
          const d = new Date(cleanTanggal);
          if (!isNaN(d.getTime())) {
            try {
              // Convert the UTC instant back to school's timezone (Asia/Jakarta) in "YYYY-MM-DD" format
              const formatter = new Intl.DateTimeFormat('fr-CA', {
                timeZone: 'Asia/Jakarta',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              });
              cleanTanggal = formatter.format(d);
            } catch (e) {
              cleanTanggal = cleanTanggal.split("T")[0];
            }
          } else {
            cleanTanggal = cleanTanggal.split("T")[0];
          }
        }
        return {
          id: String(j.id),
          tanggal: cleanTanggal,
          jamKe0GedungA: String(j.jamKe0GedungA || ""),
          jamKe0GedungB: String(j.jamKe0GedungB || ""),
          dzuhurGedungA: String(j.dzuhurGedungA || ""),
          dzuhurGedungB: String(j.dzuhurGedungB || ""),
          kultumGedungA: String(j.kultumGedungA || ""),
          kultumGedungB: String(j.kultumGedungB || ""),
          cadanganKultumGedungA: String(j.cadanganKultumGedungA || ""),
          cadanganKultumGedungB: String(j.cadanganKultumGedungB || ""),
          azanGedungA: String(j.azanGedungA || ""),
          azanGedungB: String(j.azanGedungB || ""),
          tadarusGedungA: String(j.tadarusGedungA || ""),
          tadarusGedungB: String(j.tadarusGedungB || "")
        };
      });

      return {
        tahunAjaran,
        kelas,
        siswa,
        users,
        jadwal
      };
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching data from server:", error);
    throw error;
  }
};

export const saveToGAS = async (action: string, data: any, id?: string) => {
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data, id })
    });
    
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json.status === "success") {
        return json;
      }
      throw new Error(json.message || "GAS Error");
    } catch (e) {
      console.warn("GAS returned non-JSON or error:", text);
      return null;
    }
  } catch (error) {
    console.error(`Error saving ${action} to GAS:`, error);
    return null;
  }
};
