import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/User.css";

const API = "http://localhost:3000/users";

export default function User() {
  const [users, setUsers] = useState([]);

  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    username: "",
    password: "",
    role: "user",
  });


  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchUsers = () => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (u) => u.role === "admin" || u.role === "petugas" || u.role === "user"
        );
        setUsers(filtered);
      })
      .catch((err) => console.error(err));
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setMode("create");
    setEditingId(null);
    setForm({ nama: "", username: "", password: "", role: "user" });
  };


  const onChange = (e) => {
    setMsg("");
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const isEdit = mode === "edit";
      const url = isEdit ? `${API}/${editingId}` : API;
      const method = isEdit ? "PUT" : "POST";

      const payload = isEdit
        ? {
          nama: form.nama,
          username: form.username,
          password: form.password,
          role: form.role,
        }
        : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data.message || "Terjadi kesalahan");
        setLoading(false);
        return;
      }

      setMsg(data.message || (isEdit ? "Berhasil update" : "Berhasil tambah"));
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error(err);
      setMsg("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (u) => {
    setMsg("");
    setMode("edit");
    setEditingId(u.id_user);
    setForm({
      nama: u.nama,
      username: u.username,
      password: "",
      role: u.role,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus user ini?")) return;

    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchUsers();

    if (mode === "edit" && editingId === id) resetForm();
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main userPage">
        <div className="pageHeader">
          <div>
            <h2>CRUD Admin & Petugas</h2>
            <p>Kelola data admin dan petugas</p>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <h3>
              {mode === "create" ? "Tambah User" : `Edit User (ID: ${editingId})`}
            </h3>

            {mode === "edit" && (
              <button className="btn btnGhost" type="button" onClick={resetForm}>
                Batal
              </button>
            )}
          </div>

          {msg && <div className="alert">{msg}</div>}

          <form onSubmit={handleSubmit} className="formGrid" autoComplete="off">
            <div className="formGroup">
              <label>Nama</label>
              <input
                name="nama"
                value={form.nama}
                onChange={onChange}
                placeholder="Masukkan nama"
                required
              />
            </div>

            <div className="formGroup">
              <label>Username</label>
              <input
                key={`username-${mode}-${editingId ?? "new"}`}
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="Masukkan username"
                required
                autoComplete="new-username"
              />
              </div>

            <div className="formGroup">
              <label>Password</label>
              <input
                key={`password-${mode}-${editingId ?? "new"}`}
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder={mode === "edit" ? "Kosongkan jika tidak diganti" : "Masukkan password"}
                required={mode === "create"}
                autoComplete="new-password"
              />


            </div>

            <div className="formGroup">
              <label>Role</label>
              <select name="role" value={form.role} onChange={onChange} required>
                <option value="admin">admin</option>
                <option value="petugas">petugas</option>
                <option value="user">user</option>
              </select>
            </div>


            <div className="formActions">
              <button className="btn btnPrimary" type="submit" disabled={loading}>
                {loading ? "Proses..." : mode === "create" ? "Tambah" : "Simpan"}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="cardHeader">
            <h3>Daftar User</h3>
            <span className="badge">{users.length} data</span>
          </div>

          <div className="tableWrap">
            <table className="prettyTable">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>No</th>
                  <th>Nama</th>
                  <th>Username</th>
                  <th style={{ width: 140 }}>Role</th>
                  <th style={{ width: 200 }}>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="emptyCell">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u.id_user}>
                      <td>{i + 1}</td>
                      <td className="nameCell">{u.nama}</td>
                      <td className="muted">{u.username}</td>
                      <td>
                        <span
                          className={`pill ${u.role === "admin"
                            ? "pillAdmin"
                            : u.role === "petugas"
                              ? "pillPetugas"
                              : "pillUser"
                            }`}
                        >
                          {u.role}
                        </span>

                      </td>
                      <td>
                        <div className="rowActions">
                          <button
                            className="btn btnWarn"
                            type="button"
                            onClick={() => handleEdit(u)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btnDanger"
                            type="button"
                            onClick={() => handleDelete(u.id_user)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

}
