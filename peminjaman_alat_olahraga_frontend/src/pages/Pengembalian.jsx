import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import "../styles/Pengembalian.css";
import Sidebar from "../components/Sidebar";

function Pengembalian() {
  const [data, setData] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "petugas") {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch("http://localhost:3000/pengembalian");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      }
    };

    getData(); 

    const interval = setInterval(getData, 3000); 
    return () => clearInterval(interval); 
  }, []);


  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div className="pengembalian-container">
        <h2>Data Pengembalian Alat</h2>

        <button onClick={() => window.location.reload()} style={{ marginBottom: 12 }}>
          Refresh
        </button>


        <table className="pengembalian-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Peminjam</th>
              <th>Nama Alat</th>
              <th>Tanggal Dikembalikan</th>
              <th>Kondisi</th>
              <th>Denda</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={item.id_pengembalian}>
                  <td>{index + 1}</td>
                  <td>{item.nama_peminjam}</td>
                  <td>{item.nama_alat}</td>
                  <td>{new Date(item.tanggal_dikembalikan).toLocaleString("id-ID")}</td>
                  <td>{item.kondisi_alat}</td>
                  <td>{"Rp " + Number(item.denda || 0).toLocaleString("id-ID")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Belum ada data pengembalian</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Pengembalian;
