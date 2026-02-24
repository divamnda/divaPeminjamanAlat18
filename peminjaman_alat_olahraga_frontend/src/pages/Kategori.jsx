import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/kategori.css";

export default function Kategori() {
    const [kategori, setKategori] = useState([]);
    const [namaKategori, setNamaKategori] = useState("");
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [stok, setStok] = useState(1);


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

        const id = editId;
        const url = id
            ? `http://localhost:3000/kategori/${id}`
            : "http://localhost:3000/kategori";

        const method = id ? "PUT" : "POST";

        const payload = {
            nama_kategori: namaKategori.trim(),
            stok: Number(stok),
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const raw = await res.text();
            let result;
            try {
                result = raw ? JSON.parse(raw) : {};
            } catch {
                result = { message: raw };
            }

            console.log("DEBUG UPDATE:", {
                url,
                method,
                status: res.status,
                payload,
                raw,      
                result,   
            });

            if (!res.ok) {
                alert(result?.message || `Gagal menyimpan (HTTP ${res.status})`);
                return;
            }

            alert(id ? "Kategori berhasil diupdate" : "Kategori berhasil ditambah");

            setNamaKategori("");
            setEditId(null);
            setShowForm(false);
            setStok(1);
            getKategori();
        } catch (err) {
            console.error("Fetch error:", err);
            alert("Gagal terhubung ke server.");
        }
    };


    const handleEdit = (k) => {
        const id = k.id_kategori ?? k.id;
        setNamaKategori(k.nama_kategori);
        setEditId(id);
        setShowForm(true);
        setStok(k.stok ?? 1);
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
                            setStok(1);
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
                                const id = k.id_kategori ?? k.id;

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

                            <input
                                type="number"
                                placeholder="Stok"
                                value={stok}
                                min={1}
                                step={1}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setStok(Number.isNaN(val) ? 1 : Math.max(1, val));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                                        e.preventDefault();
                                    }
                                }}
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
                                    setStok(1);
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
