import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/kategori.css";

export default function Kategori() {
    const [kategori, setKategori] = useState([]);
    const [namaKategori, setNamaKategori] = useState("");
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const getKategori = async () => {
        try {
            const res = await fetch("http://localhost:3000/kategori");
            const data = await res.json();
            setKategori(data);
        } catch (error) {
            console.error("Gagal ambil kategori:", error);
        }
    };

    useEffect(() => {
        getKategori();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editId
            ? `http://localhost:3000/kategori/${editId}`
            : "http://localhost:3000/kategori";

        const method = editId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nama_kategori: namaKategori })
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.message || "Gagal menyimpan");
                return;
            }

            alert(editId ? "Kategori berhasil diupdate" : "Kategori berhasil ditambah");

            setNamaKategori("");
            setEditId(null);
            setShowForm(false);
            getKategori();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (k) => {
        setNamaKategori(k.nama_kategori);
        setEditId(k.id);
        setShowForm(true);
    };


    const handleDelete = async (id) => {
        console.log("ID dikirim ke backend:", id);

        const yakin = window.confirm("Yakin hapus?");
        if (!yakin) return;

        try {
            const res = await fetch(`http://localhost:3000/kategori/${id}`, {
                method: "DELETE"
            });

            const result = await res.json();
            console.log(result);

            if (!res.ok) {
                alert(result.message || "Gagal hapus");
                return;
            }

            alert("Berhasil dihapus");
            getKategori();
        } catch (err) {
            console.error(err);
        }
    };



    return (
        <div className="dashboard">
            <Sidebar />

            <div className="main">
                <div className="header">
                    <h2>Data Kategori</h2>
                    <button
                        className="btn-tambah"
                        onClick={() => {
                            setShowForm(true);
                            setEditId(null);
                            setNamaKategori("");
                        }}
                    >
                        + Tambah Kategori
                    </button>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Kategori</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {kategori.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: "center" }}>
                                    Belum ada kategori
                                </td>
                            </tr>
                        ) : (
                            kategori.map((k, i) => {
                                const id = k.id_kategori ?? k.id; // jaga-jaga kalau backend kirim "id"

                                return (
                                    <tr key={id ?? `row-${i}`}>
                                        <td>{i + 1}</td>
                                        <td>{k.nama_kategori}</td>
                                        <td className="aksi">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(k)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn-hapus"
                                                onClick={() => handleDelete(id)}
                                                disabled={!id}
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>

                </table>
            </div>

            {showForm && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h3>{editId ? "Edit Kategori" : "Tambah Kategori"}</h3>

                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Nama Kategori"
                                value={namaKategori}
                                onChange={(e) => setNamaKategori(e.target.value)}
                                required
                            />

                            <button type="submit">
                                {editId ? "Update" : "Simpan"}
                            </button>

                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditId(null);
                                    setNamaKategori("");
                                }}
                            >
                                Batal
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
