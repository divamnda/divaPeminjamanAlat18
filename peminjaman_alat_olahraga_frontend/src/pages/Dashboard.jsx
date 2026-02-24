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
      const userLogin = JSON.parse(localStorage.getItem("user")) || {};
      const role = userLogin?.role;

      const url = "http://localhost:3000/api/dashboard";

      const res = await fetch(url);
      const payload = await res.json();

      setData({
        alatTersedia: payload?.alatTersedia ?? 0,
        sedangDipinjam: payload?.sedangDipinjam ?? 0,
        selesai: payload?.selesai ?? 0,
        orders: Array.isArray(payload?.orders) ? payload.orders : [],
      });

      console.log("URL dashboard:", url);
      console.log("orders length:", payload?.orders?.length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const ordersTampil = useMemo(() => {
    return Array.isArray(data.orders) ? data.orders : [];
  }, [data.orders]);


  useEffect(() => {
    console.log("== DEBUG USER ==");
    console.log("userLogin:", userLogin);
    console.log("role:", role);
    console.log("namaUser:", namaUser);

    console.log("== DEBUG ORDERS ==");
    console.log("total orders dari API:", data.orders?.length);
    console.log("contoh order pertama:", data.orders?.[0]);

    console.log("== DEBUG FILTER ==");
    const kandidatUser = [
      userLogin?.nama,
      userLogin?.username,
      userLogin?.name,
      userLogin?.id,
      userLogin?.id_user,
      userLogin?.user_id,
    ]
      .filter(Boolean)
      .map((v) => String(v).trim().toLowerCase());

    console.log("kandidatUser:", kandidatUser);

    const cobaMatch = (data.orders || []).slice(0, 5).map((o) => ({
      nama_peminjam: o.nama_peminjam,
      nama_user: o.nama_user,
      username: o.username,
      id_user: o.id_user,
      user_id: o.user_id,
    }));
    console.log("5 order pertama (field penting):", cobaMatch);
  }, [userLogin, role, namaUser, data.orders]);



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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(ordersTampil.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = ordersTampil.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
    if (ordersTampil.length === 0) {
      setCurrentPage(1);
    }
  }, [ordersTampil.length, totalPages, currentPage]);


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

  const formatTanggal = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);

    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
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
              currentOrders.map((item) => (
                <tr key={item.id_pinjam}>
                  <td>{item.nama_peminjam}</td>
                  <td>{item.nama_alat}</td>
                  <td>{formatTanggal(item.tgl_pinjam)}</td>
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

        {ordersTampil.length > 0 && (
          <div className="pagination">
            <button
              className="pgBtn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <div className="pgInfo">
              Halaman <b>{currentPage}</b> dari <b>{totalPages}</b>
            </div>

            <button
              className="pgBtn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
