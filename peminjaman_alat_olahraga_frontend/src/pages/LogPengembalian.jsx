import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/log.css";
import Pagination from "../components/Pagination";

export default function LogPengembalian() {
  const [log, setLog] = useState([]);

  const role = (localStorage.getItem("role") || "").trim().toLowerCase();
  const isPetugas = role === "user" || role === "petugas";

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [loadingId, setLoadingId] = useState(null);

  const getLog = async () => {
    try {
      const res = await fetch("http://localhost:3000/log-pengembalian");
      const text = await res.text();

      let result = [];
      try {
        result = text ? JSON.parse(text) : [];
      } catch (e) {
        console.error("Response bukan JSON valid:", e);
        result = [];
      }

      const arr = Array.isArray(result) ? result : [];
      setLog(arr);
    } catch (err) {
      console.error("Gagal ambil log:", err);
      setLog([]);
    }
  };

  useEffect(() => {
    getLog();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [log.length]);

  const totalPages = Math.ceil(log.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const pagedData = log.slice(startIndex, startIndex + pageSize);

  const setujuiPengembalian = async (id_log) => {
    try {
      setLoadingId(id_log);

      const res = await fetch(
        `http://localhost:3000/log-pengembalian/${id_log}/setujui`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status_pengembalian: "disetujui" }),
        }
      );

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        console.error("Gagal setujui:", res.status, text);
        alert("Gagal menyetujui pengembalian. Cek console / backend.");
        return;
      }

      await getLog();



      alert("Pengembalian berhasil disetujui!");
    } catch (err) {
      console.error("Error setujuiPengembalian:", err);
      alert("Terjadi error saat menyetujui pengembalian.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <div className="header">
          <h2>Log Pengembalian</h2>

          <p style={{ fontSize: 12 }}>
            role: {String(localStorage.getItem("role"))} | isPetugas: {String(isPetugas)}
          </p>

        </div>

        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Peminjam</th>
              <th>Alat</th>
              <th>Jumlah</th>
              <th>Kondisi</th>
              <th>Tanggal</th>



              {isPetugas && <th>Aksi</th>}
            </tr>
          </thead>

          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={isPetugas ? 7 : 6} style={{ textAlign: "center" }}>
                  Belum ada log pengembalian
                </td>
              </tr>
            ) : (
              pagedData.map((l, i) => {
                const status = (l.status_pengembalian || "pending").toLowerCase();
                const sudahDisetujui = status === "disetujui";

                return (
                  <tr key={l.id_log}>
                    <td>{startIndex + i + 1}</td>
                    <td>{l.nama_peminjam}</td>
                    <td>{l.nama_alat}</td>
                    <td>{l.jumlah}</td>
                    <td>
                      <span className={`badge ${(l.kondisi || "").toLowerCase()}`}>
                        {l.kondisi}
                      </span>
                    </td>
                    <td>{l.tanggal || "-"}</td>

                    {isPetugas && (
                      <td>
                        {sudahDisetujui ? (
                          <span className="badge baik">disetujui</span>
                        ) : (
                          <button
                            className="btn-approve"
                            disabled={loadingId === l.id_log}
                            onClick={() => setujuiPengembalian(l.id_log)}
                          >
                            {loadingId === l.id_log ? "Memproses..." : "Setujui"}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>
    </div>
  );
}
