import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const userLogin = JSON.parse(localStorage.getItem("user"));
  const role = userLogin?.role;

  const isPeminjam = role === "user";
  const isPetugas = role === "petugas";
  const isAdmin = role === "admin";

  const namaUser = userLogin?.nama || userLogin?.username || userLogin?.name || "";

  const [data, setData] = useState({
    alatTersedia: 0,
    sedangDipinjam: 0,
    selesai: 0,
    orders: []
  });

  const fetchDashboard = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/dashboard");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const ordersTampil = useMemo(() => {
    if (!Array.isArray(data.orders)) return [];

    if (!isPeminjam) return data.orders;

    const namaLower = (namaUser || "").toLowerCase();
    return data.orders.filter((o) => (o.nama_peminjam || "").toLowerCase() === namaLower);
  }, [data.orders, isPeminjam, namaUser]);

  const cardAngka = useMemo(() => {
    if (!isPeminjam) {
      return {
        alatTersedia: data.alatTersedia,
        sedangDipinjam: data.sedangDipinjam,
        selesai: data.selesai
      };
    }

    const sedangDipinjam = ordersTampil.filter((o) => o.status === "Dipinjam").length;
    const selesai = ordersTampil.filter((o) => o.status === "Dikembalikan").length;

    return {
      alatTersedia: data.alatTersedia,
      sedangDipinjam,
      selesai
    };
  }, [data.alatTersedia, data.sedangDipinjam, data.selesai, isPeminjam, ordersTampil]);

  const handleKembali = async (id_pinjam) => {
    const yakin = confirm("Yakin ingin mengembalikan alat?");
    if (!yakin) return;

    try {
      const res = await fetch("http://localhost:3000/peminjaman/kembali", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_pinjam })
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Gagal mengembalikan alat");
        return;
      }

      alert("Pengembalian berhasil");
      fetchDashboard(); 
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <div className="cards">
          <div className="card">
            Alat Tersedia
            <h2>{cardAngka.alatTersedia}</h2>
          </div>

          <div className="card">
            Sedang Dipinjam
            <h2>{cardAngka.sedangDipinjam}</h2>
          </div>

          <div className="card">
            Selesai
            <h2>{cardAngka.selesai}</h2>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nama User</th>
              <th>Nama Alat</th>
              <th>Tanggal Pinjam</th>
              <th>Status</th>

              {isPeminjam && <th>Aksi</th>}
            </tr>
          </thead>

          <tbody>
            {ordersTampil.length === 0 ? (
              <tr>
                <td colSpan={isPeminjam ? 5 : 4} style={{ textAlign: "center" }}>
                  Belum ada data
                </td>
              </tr>
            ) : (
              ordersTampil.map((item) => (
                <tr key={item.id_pinjam}>
                  <td>{item.nama_peminjam}</td>
                  <td>{item.nama_alat}</td>
                  <td>{item.tgl_pinjam}</td>
                  <td>{item.status}</td>

                  {isPeminjam && (
                    <td>
                      {item.status === "Dipinjam" && (
                        <button className="btn-kembali" onClick={() => handleKembali(item.id_pinjam)}>
                          Kembalikan
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {isPeminjam && (
          <p style={{ marginTop: 12, color: "#64748b" }}>
            Menampilkan peminjaman milik: <b>{namaUser || "-"}</b>
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
