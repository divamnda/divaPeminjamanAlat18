import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const isAdmin = role === "admin";
  const isPetugas = role === "petugas";
  const isUser = role === "user"; 
  const location = useLocation();
  const active = (path) => (location.pathname === path ? "active" : "");

  return (
    <aside className="sidebar">
      <div>
        <h2 className="logo">Sports Equipment Center</h2>

        <ul className="menu">
          <li>
            <Link className={active("/dashboard")} to="/dashboard">
              Dashboard
            </Link>
          </li>

          {isUser && (
            <>
              <li>
                <Link className={active("/alat")} to="/alat">
                  Daftar Alat
                </Link>
              </li>
              <li>
                <Link className={active("/peminjaman")} to="/peminjaman">
                  Peminjaman
                </Link>
              </li>
            </>
          )}

          {isPetugas && (
            <>
              <li>
                <Link className={active("/peminjaman")} to="/peminjaman">
                  Peminjaman (Setujui)
                </Link>
              </li>
              <li>
                <Link className={active("/log-pengembalian")} to="/log-pengembalian">
                  Log Pengembalian
                </Link>
              </li>
              <li>
                <Link className={active("/laporan")} to="/laporan">
                  Laporan
                </Link>
              </li>
            </>
          )}

          {isAdmin && (
            <>
              <li>
                <Link className={active("/user")} to="/user">
                  User
                </Link>
              </li>
              <li>
                <Link className={active("/kategori")} to="/kategori">
                  Kategori
                </Link>
              </li>
              <li>
                <Link className={active("/alat")} to="/alat">
                  Alat
                </Link>
              </li>
              <li>
                <Link className={active("/peminjaman")} to="/peminjaman">
                  Peminjaman
                </Link>
              </li>
              <li>
                <Link className={active("/log-pengembalian")} to="/log-pengembalian">
                  Log Pengembalian
                </Link>
              </li>
              <li>
                <Link className={active("/log-aktivitas")} to="/log-aktivitas">
                  Log Aktivitas
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      <button
        className="logout-btn"
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </aside>
  );
}
