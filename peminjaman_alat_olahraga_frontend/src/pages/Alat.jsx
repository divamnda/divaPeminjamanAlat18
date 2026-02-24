import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/alat.css";

export default function Alat() {
  const [alat, setAlat] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [showStokPopup, setShowStokPopup] = useState(false);
  const [stokTambah, setStokTambah] = useState("");
  const [stokId, setStokId] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [namaAlat, setNamaAlat] = useState("");
  const [stok, setStok] = useState("");
  const [kondisi, setKondisi] = useState("");
  const [kategoriId, setKategoriId] = useState("");

  const userLogin = JSON.parse(localStorage.getItem("user"));
  const role = userLogin?.role;
  const isPeminjam = role === "user";
  const canManage = !isPeminjam;

  const fetchAlat = async () => {
    try {
      const res = await fetch("http://localhost:3000/alat");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setAlat(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal ambil alat:", err);
      setAlat([]);
    }
  };

  const fetchKategori = async () => {
    try {
      const res = await fetch("http://localhost:3000/kategori");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setKategori(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal ambil kategori:", err);
      setKategori([]);
    }
  };



  useEffect(() => {
    fetchAlat();
    fetchKategori();
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nama_alat: namaAlat,
      stok: Number(stok),
      kondisi,
      kategori_id: Number(kategoriId),
    };

    const url = editMode
      ? `http://localhost:3000/alat/${editId}`
      : "http://localhost:3000/alat";

    const method = editMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch (err) {

        result = { message: text };
      }

      if (!res.ok) {
        console.error("Tambah/Edit alat gagal:", result);
        alert(result.message || "Server error saat simpan alat (500). Cek backend.");
        return;
      }

      alert(editMode ? "Data berhasil diupdate" : "Data berhasil ditambahkan");
      resetForm();
      fetchAlat();
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server");
    }
  };

  const resetForm = () => {
    setNamaAlat("");
    setStok("");
    setKondisi("");
    setKategoriId("");
    setEditMode(false);
    setEditId(null);
    setShowPopup(false);
  };

  const handleTambahStok = async (e) => {
    e.preventDefault();

    await fetch(`http://localhost:3000/alat/${stokId}/tambah-stok`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jumlah: Number(stokTambah) })
    });

    setShowStokPopup(false);
    setStokTambah("");
    fetchAlat();
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus alat ini?")) return;

    await fetch(`http://localhost:3000/alat/${id}`, { method: "DELETE" });
    fetchAlat();
  };

  const handleEdit = (item) => {
    setEditId(item.id_alat);
    setNamaAlat(item.nama_alat);
    setStok(item.stok);
    setKondisi(item.kondisi);
    setKategoriId(item.kategori_id?.toString() || "");
    setEditMode(true);
    setShowPopup(true);
  };


  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <div className="header-alat">
          <h2>Daftar Alat</h2>

          {canManage && (
            <button onClick={() => {
              setEditMode(false);
              setShowPopup(true);
            }}>
              Tambah Alat
            </button>
          )}
        </div>


        {showPopup && (
          <div className="popup-overlay" onClick={resetForm}>
            <form
              className="popup-form"
              onClick={e => e.stopPropagation()}
              onSubmit={handleSubmit}
            >
              <h3>{editMode ? "Edit Alat" : "Tambah Alat Baru"}</h3>

              <input
                type="text"
                placeholder="Nama Alat"
                value={namaAlat}
                onChange={e => setNamaAlat(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Stok"
                value={stok}
                min={1}
                step={1}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (Number.isNaN(val)) {
                    setStok(1);
                    return;
                  }
                  setStok(Math.max(1, val));
                }}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                    e.preventDefault();
                  }
                }}
                required
              />


              <input
                type="text"
                placeholder="Kondisi"
                value={kondisi}
                onChange={e => setKondisi(e.target.value)}
                required
              />

              <select
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {kategori.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kategori}
                  </option>
                ))}
              </select>

              <div className="popup-buttons">
                <button type="submit">{editMode ? "Update" : "Simpan"}</button>
                <button type="button" onClick={resetForm}>Batal</button>
              </div>
            </form>

          </div>
        )}

        {showStokPopup && (
          <div
            className="popup-overlay"
            onClick={() => setShowStokPopup(false)}
          >
            <form
              className="popup-form"
              onClick={e => e.stopPropagation()}
              onSubmit={handleTambahStok}
            >
              <h3>Tambah Stok</h3>

              <input
                type="number"
                placeholder="Jumlah stok"
                value={stokTambah}
                min={1}
                step={1}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStokTambah(Number.isNaN(val) ? 1 : Math.max(1, val));
                }}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                    e.preventDefault();
                  }
                }}
                required
              />

              <div className="popup-buttons">
                <button type="submit">Simpan</button>
                <button
                  type="button"
                  onClick={() => setShowStokPopup(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Nama Alat</th>
              <th>Stok</th>
              <th>Kondisi</th>
              <th>Kategori</th>
              {canManage && <th>Aksi</th>}
            </tr>

          </thead>

          <tbody>
            {Array.isArray(alat) && alat.length > 0 ? (
              alat.map((item) => (
                <tr key={item.id_alat}>
                  <td>{item.nama_alat}</td>
                  <td>{item.stok}</td>
                  <td>{item.kondisi}</td>
                  <td>{item.nama_kategori || "-"}</td>

                  {canManage && (
                    <td>
                      <button onClick={() => handleEdit(item)}>Edit</button>
                      <button onClick={() => handleDelete(item.id_alat)}>Hapus</button>
                      <button
                        onClick={() => {
                          setStokId(item.id_alat);
                          setStokTambah(1);
                          setShowStokPopup(true);
                        }}
                      >
                        + Stok
                      </button>

                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canManage ? 5 : 4} style={{ textAlign: "center" }}>
                  Data alat belum ada / gagal dimuat
                </td>
              </tr>
            )}
          </tbody>


        </table>
      </div>
    </div>
  );

}
