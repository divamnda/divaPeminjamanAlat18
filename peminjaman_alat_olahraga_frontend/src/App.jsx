import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alat from "./pages/Alat";
import User from "./pages/User";
import Peminjaman from "./pages/Peminjaman";
import Kategori from "./pages/Kategori";
import LogPengembalian from "./pages/LogPengembalian";
import LogAktivitas from "./pages/LogAktivitas";
import Pengembalian from "./pages/Pengembalian";
import LaporanPetugas from "./pages/LaporanPetugas";
// import Layout from "./Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route>
                  {/* <Route element={<Layout />}> */}

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alat" element={<Alat />} />
          <Route path="/user" element={<User />} />
          <Route path="/peminjaman" element={<Peminjaman />} />
          <Route path="/kategori" element={<Kategori />} />
          <Route path="/log-pengembalian" element={<LogPengembalian />} />
          <Route path="/log-aktivitas" element={<LogAktivitas />} />
          <Route path="/pengembalian" element={<Pengembalian />} />
          <Route path="/laporan" element={<LaporanPetugas />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
