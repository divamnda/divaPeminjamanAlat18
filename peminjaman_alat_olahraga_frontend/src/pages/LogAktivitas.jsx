import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Pagination from "../components/Pagination"; 

const LogAktivitas = () => {
  const [log, setLog] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetch("http://localhost:3000/log-aktivitas")
      .then((res) => res.json())
      .then((data) => setLog(data))
      .catch((err) => console.error(err));
  }, []);

  const totalPages = Math.ceil(log.length / ITEMS_PER_PAGE);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return log.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [log, currentPage]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <h2>Log Aktivitas</h2>

        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Aktivitas</th>
              <th>Tabel</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {log.length === 0 ? (
              <tr>
                <td colSpan="4" align="center">
                  Belum ada aktivitas
                </td>
              </tr>
            ) : (
              currentData.map((l, i) => {
                const nomor = (currentPage - 1) * ITEMS_PER_PAGE + i + 1;
                return (
                  <tr key={l.id_log}>
                    <td>{nomor}</td>
                    <td>{l.aktivitas}</td>
                    <td>{l.tabel}</td>
                    <td>
                      {l.waktu ? new Date(l.waktu).toLocaleString("id-ID") : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          maxButtons={5}
        />
      </div>
    </div>
  );
};

export default LogAktivitas;
