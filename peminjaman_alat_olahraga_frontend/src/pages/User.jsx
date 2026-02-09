import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function User() {
  const [users, setUsers] = useState([]);

  const fetchUsers = () => {
    fetch("http://localhost:3000/users")
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(
          u => u.role === "admin" || u.role === "petugas"
        );
        setUsers(filtered);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus user ini?")) return;

    await fetch(`http://localhost:3000/users/${id}`, {
      method: "DELETE",
    });

    fetchUsers();
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <h2>Data Admin & Petugas</h2>

        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Username</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" align="center">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr key={u.id_user}>
                  <td>{i + 1}</td>
                  <td>{u.nama}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    <button onClick={() => handleDelete(u.id_user)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}
