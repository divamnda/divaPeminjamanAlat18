import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/peminjaman.css";
import Pagination from "../components/Pagination";

const todayLocalYMD = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const addDaysYMD = (ymd, days) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d); // local
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function Peminjaman() {
  const userLogin = JSON.parse(localStorage.getItem("user"));
  const role = userLogin?.role;

  const isPeminjam = role === "user";
  const isPetugas = role === "petugas";
  const isAdmin = role === "admin";

  const namaUser = userLogin?.username || userLogin?.nama || "";


  const [alat, setAlat] = useState([]);
  const [data, setData] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({
    nama_peminjam: "",
    no_hp: "",
    alamat: "",
    id_alat: "",
    jumlah: "",
    tgl_pinjam: "",
    tgl_rencana_kembali: "",
  });

  const getPeminjaman = async () => {
    try {
      const res = await fetch("http://localhost:3000/peminjaman");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Gagal ambil data peminjaman:", error);
    }
  };

  useEffect(() => {
    getPeminjaman();

    fetch("http://localhost:3000/alat")
      .then((res) => res.json())
      .then((data) => setAlat(data))
      .catch((err) => console.error("Gagal ambil data alat:", err));
  }, []);

  const handleSetujui = async (id_pinjam) => {
    const yakin = confirm("Yakin setujui peminjaman ini?");
    if (!yakin) return;

    try {
      const res = await fetch(
        `http://localhost:3000/peminjaman/setujui/${id_pinjam}`,
        { method: "PUT" }
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Gagal menyetujui");
        return;
      }

      alert("Peminjaman berhasil disetujui");
      getPeminjaman();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    }
  };

  const handleKembali = async (id_pinjam) => {
    const yakin = confirm("Yakin ingin mengembalikan alat ini?");
    if (!yakin) return;

    const userLogin = JSON.parse(localStorage.getItem("user"));

    const id_petugas =
      userLogin?.id_petugas ||
      userLogin?.id_user ||
      userLogin?.id ||
      null;

    try {
      const res = await fetch("http://localhost:3000/pengembalian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_peminjaman: id_pinjam,
          kondisi_alat: "baik",
          id_petugas: id_petugas,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Gagal mengembalikan alat");
        return;
      }

      alert(result.message || "Pengembalian berhasil");
      getPeminjaman();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    }
  };

  const handleHapus = async (id_pinjam) => {
    const yakin = confirm("Yakin ingin menghapus data peminjaman ini?");
    if (!yakin) return;

    try {
      const res = await fetch(`http://localhost:3000/peminjaman/${id_pinjam}`, {
        method: "DELETE",
      });


      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(result.message || "Gagal menghapus data");
        return;
      }

      alert("Data berhasil dihapus");
      getPeminjaman();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus");
    }
  };


  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tgl = form.tgl_pinjam || todayLocalYMD();
    const rencana = form.tgl_rencana_kembali || addDaysYMD(tgl, 1);

    const payload = {
      ...form,
      nama_peminjam: namaUser,
      tgl_pinjam: tgl,
      tgl_rencana_kembali: rencana,
      id_alat: Number(form.id_alat),
      jumlah: Number(form.jumlah),
    };



    console.log("PAYLOAD KIRIM:", payload);

    try {
      const res = await fetch("http://localhost:3000/peminjaman/ajukan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("RESP TEXT:", text);

      let result = {};
      try { result = text ? JSON.parse(text) : {}; } catch { result = { message: text }; }

      if (!res.ok) {
        alert(result.message || "Gagal mengajukan peminjaman");
        return;
      }

      alert(result.message || "Pengajuan berhasil");
      await getPeminjaman();
      setShowPopup(false);
      setForm({
        nama_peminjam: "",
        no_hp: "",
        alamat: "",
        id_alat: "",
        jumlah: "",
        tgl_pinjam: "",
        tgl_rencana_kembali: "",
      });
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const dataTampil = data;

  const totalPages = Math.ceil(dataTampil.length / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;
  const pagedData = dataTampil.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [dataTampil.length]);

  const pad2 = (n) => String(n).padStart(2, "0");

  const formatTanggal = (value) => {
    if (!value) return "-";
    const s = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    if (s.includes("T")) {
      const dt = new Date(s);
      if (!Number.isNaN(dt.getTime())) {
        return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
      }
      return s.split("T")[0];
    }

    if (s.includes(" ")) return s.split(" ")[0];

    return s;
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <div className="header">
          <h2>Peminjaman Alat</h2>



          {isPeminjam && (
            <button
              className="btn-tambah"
              onClick={() => {
                setForm((f) => ({
                  ...f,
                  nama_peminjam: namaUser,
                  tgl_pinjam: todayLocalYMD(),
                  tgl_rencana_kembali: addDaysYMD(todayLocalYMD(), 1),
                }));
                setShowPopup(true);
              }}

            >
              + Ajukan Peminjaman
            </button>

          )}
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>No HP</th>
              <th>Alamat</th>
              <th>Alat</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Tanggal</th>
              {(isPetugas || isPeminjam || isAdmin) && <th>Aksi</th>}
            </tr>
          </thead>


          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={isPetugas || isPeminjam || isAdmin ? 8 : 7}>
                  Belum ada data
                </td>
              </tr>
            ) : (
              pagedData.map((p) => (
                <tr key={p.id_pinjam}>
                  <td>{p.nama_peminjam}</td>
                  <td>{p.no_hp}</td>
                  <td>{p.alamat}</td>
                  <td>{p.nama_alat}</td>
                  <td>{p.jumlah}</td>
                  <td>{p.status}</td>
                  <td>
                    {formatTanggal(p.tgl_pinjam)} <br />
                    <small>Rencana: {formatTanggal(p.tgl_rencana_kembali)}</small>
                  </td>


                  {(isPetugas || isPeminjam || isAdmin) && (
                    <td className="aksi">
                      {(isAdmin || isPetugas) && (
                        <button className="btn-hapus" onClick={() => handleHapus(p.id_pinjam)}>
                          Hapus
                        </button>
                      )}

                      {isPetugas && p.status === "Menunggu" && (
                        <button className="btn-setujui" onClick={() => handleSetujui(p.id_pinjam)}>
                          Setujui
                        </button>
                      )}

                      {isPeminjam && p.status === "Dipinjam" && (
                        <button className="btn-kembali" onClick={() => handleKembali(p.id_pinjam)}>
                          Kembalikan
                        </button>
                      )}

                      {!(
                        (isAdmin || isPetugas) ||
                        (isPetugas && p.status === "Menunggu") ||
                        (isPeminjam && p.status === "Dipinjam")
                      ) && <span style={{ color: "#94a3b8" }}>-</span>}
                    </td>

                  )}
                </tr>
              ))
            )}
          </tbody>


        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />

      </div>
      {isPeminjam && showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Ajukan Peminjaman</h3>

            <form onSubmit={handleSubmit}>

              <input
                type="text"
                name="nama_peminjam"
                value={form.nama_peminjam}
                readOnly
                placeholder="Nama Peminjam"
                style={{ background: "#f1f5f9" }}
              />

              <input
                type="text"
                name="no_hp"
                placeholder="Masukkan no HP"
                value={form.no_hp}
                onChange={handleChange}
                required
              />
              <textarea
                name="alamat"
                placeholder="Masukkan alamat"
                value={form.alamat}
                onChange={handleChange}
                required
              />
              <select
                name="id_alat"
                value={form.id_alat}
                onChange={handleChange}
                required
              >
                <option value="">-- Pilih Alat --</option>
                {alat.map((a) => (
                  <option key={a.id_alat} value={a.id_alat}>
                    {a.nama_alat}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="jumlah"
                placeholder="Masukkan jumlah"
                value={form.jumlah}
                onChange={handleChange}
                required
                min="1"
              />
              <input
                type="date"
                name="tgl_pinjam"
                value={form.tgl_pinjam}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                name="tgl_rencana_kembali"
                value={form.tgl_rencana_kembali}
                onChange={handleChange}
                required
              />


              <button type="submit">Kirim Pengajuan</button>


              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowPopup(false)}
              >
                Batal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}