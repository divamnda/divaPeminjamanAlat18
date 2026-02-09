import React, { useEffect, useMemo, useState } from "react";
import "../styles/laporan.css";


const API_URL = "http://localhost:3000/laporan";

function toISODateInput(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateOnly(value) {
  if (!value) return null;

  const s = String(value).trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}


function inRangeDate(dateValue, startISO, endISO) {
  const d = parseDateOnly(dateValue);
  if (!d) return false;

  const start = parseDateOnly(startISO);
  const end = parseDateOnly(endISO);
  if (!start || !end) return true;

  return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
}

function parseDDMMYYYY(s) {
  if (!s) return null;
  const str = String(s).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split("/");
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getStatusEfektif(row) {
  const status = String(row.status ?? "").toUpperCase();
  const today = new Date();

  const due =
    parseDDMMYYYY(row.tgl_rencana_kembali) ||
    parseDDMMYYYY(row.tgl_kembali);

  if (!due) return status;

  if (status === "DIPINJAM" && today > due) return "TERLAMBAT";

  return status;
}


function downloadCSV(filename, rows) {
  const escapeCell = (cell) => {
    const s = String(cell ?? "");
    const escaped = s.replaceAll('"', '""');
    return `"${escaped}"`;
  };

  const csv = rows.map((r) => r.map(escapeCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


const DENDA_PER_HARI = 1000;

function hitungHariTerlambat(row) {
  const statusEfektif = getStatusEfektif(row);
  if (statusEfektif !== "TERLAMBAT") return 0;

  const today = new Date();
  const due = parseDDMMYYYY(row.tgl_rencana_kembali) || parseDDMMYYYY(row.tgl_kembali);
  if (!due) return 0;

  const ms = today.setHours(0, 0, 0, 0) - due.setHours(0, 0, 0, 0);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

function hitungDenda(row) {
  const daysLate = hitungHariTerlambat(row);
  const qty = Number(row.jumlah ?? 1);
  return daysLate * DENDA_PER_HARI * qty;
}


function normalizeItem(raw, index) {
  const id =
    raw.id ??
    raw.id_peminjaman ??
    raw.idPeminjaman ??
    raw.kode ??
    raw.no_transaksi ??
    raw.noTransaksi ??
    raw.id_pinjam ??
    raw.id_pinjamans ??
    raw.peminjaman_id ??
    raw.peminjamanId ??
    raw.id_peminjaman_alat ??
    "";

  const fallbackId = `TRX-${String(index + 1).padStart(4, "0")}`;

  const tanggalPinjam =
    raw.tanggalPinjam ?? raw.tanggal_pinjam ?? raw.tgl_pinjam ?? raw.created_at ?? "";

  const tanggalKembali =
    raw.tanggalKembali ?? raw.tanggal_kembali ?? raw.tgl_kembali ?? raw.returned_at ?? "";

  const status = (raw.status ?? raw.status_peminjaman ?? raw.keterangan ?? "DIPINJAM")
    .toString()
    .toUpperCase();

  const peminjamNama =
    raw?.peminjam?.nama ??
    raw?.user?.nama ??
    raw?.user?.name ??
    raw?.nama_user ??
    raw?.namaUser ??
    raw?.nama_peminjam ??
    raw?.username ??
    "-";

  const peminjamKelas =
    raw?.peminjam?.kelas ?? raw?.user?.kelas ?? raw.kelas ?? raw.kelas_user ?? "";

  const alatNama =
    raw?.alat?.nama ??
    raw?.barang?.nama ??
    raw?.alat?.nama_alat ??
    raw.nama_alat ??
    raw.alat ??
    "-";

  const kategori =
    raw?.alat?.kategori ??
    raw?.barang?.kategori ??
    raw.kategori ??
    raw.kategori_alat ??
    "Lainnya";

  const jumlah = Number(raw.jumlah ?? raw.qty ?? raw.total ?? 1);

  return {
    id: id || fallbackId,
    tanggalPinjam,
    tanggalKembali,
    status,
    jumlah,
    peminjam: { nama: peminjamNama, kelas: peminjamKelas },
    alat: { nama: alatNama, kategori },
  };
}


export default function LaporanPetugas() {
  const today = useMemo(() => new Date(), []);
  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);

  const [filter, setFilter] = useState({
    tanggalMulai: toISODateInput(sevenDaysAgo),
    tanggalSelesai: toISODateInput(today),
    status: "SEMUA",
    kategori: "SEMUA",
    q: "",
  });


  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function ambilLaporan() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Gagal ambil data (${res.status})`);
      }

      const json = await res.json();
      const rawArr = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];

      setData(rawArr);
      setPage(1);
    } catch (e) {
      setError(e.message || "Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    ambilLaporan();
  }, []);

  function updateFilter(patch) {
    setFilter((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }


  const kategoriList = useMemo(() => {
    const map = new Map();
    data.forEach((x) => {
      const raw = String(x?.kategori ?? "").trim();
      if (!raw) return;
      map.set(raw.toLowerCase(), raw);
    });
    return ["SEMUA", ...Array.from(map.values())];
  }, [data]);



  const dataTersaring = useMemo(() => {
    const q = filter.q.trim().toLowerCase();

    return data.filter((x) => {
      if (!inRangeDate(x.tgl_pinjam, filter.tanggalMulai, filter.tanggalSelesai)) {
        return false;
      }
      const statusAsli = String(x.status ?? "").toUpperCase();
      const statusEfektif = getStatusEfektif(x);

      if (filter.status !== "SEMUA") {
        if (filter.status === "TERLAMBAT") {
          if (statusEfektif !== "TERLAMBAT") return false;
        } else {
          if (statusAsli !== filter.status) return false;
        }
      }

      const kat = String(x.kategori ?? "").trim().toLowerCase();
      const katFilter = String(filter.kategori ?? "").trim().toLowerCase();
      if (filter.kategori !== "SEMUA" && kat !== katFilter) {
        return false;
      }

      if (q) {
        const peminjam = String(x?.nama_peminjam ?? "").toLowerCase();
        const alat = String(x?.nama_alat ?? "").toLowerCase();
        const kategori = String(x?.kategori ?? "").toLowerCase();
        const cocok =
          peminjam.includes(q) ||
          alat.includes(q) ||
          kategori.includes(q);

        if (!cocok) return false;
      }

      return true;
    });
  }, [data, filter]);



  const ringkasan = useMemo(() => {
    const totalTransaksi = dataTersaring.length;
    const totalDipinjam = dataTersaring.filter((x) => getStatusEfektif(x) === "DIPINJAM").length;
    const totalDikembalikan = dataTersaring.filter((x) => getStatusEfektif(x) === "DIKEMBALIKAN").length;
    const totalTerlambat = dataTersaring.filter((x) => getStatusEfektif(x) === "TERLAMBAT").length;
    const totalItem = dataTersaring.reduce((acc, x) => acc + Number(x.jumlah || 0), 0);

    return { totalTransaksi, totalDipinjam, totalDikembalikan, totalTerlambat, totalItem };
  }, [dataTersaring]);

  const totalPages = Math.max(1, Math.ceil(dataTersaring.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return dataTersaring.slice(start, start + pageSize);
  }, [dataTersaring, page]);

  function handleExportCSV() {
    const header = [
      "ID",
      "Tanggal Pinjam",
      "Tanggal Kembali",
      "Peminjam",
      "Kelas/Tim",
      "Alat",
      "Kategori",
      "Jumlah",
      "Status",
      "Denda",
    ];

    const rows = dataTersaring.map((x) => [
      x.id_pinjam ?? "",
      x.tgl_pinjam ?? "",
      x.tgl_rencana_kembali ?? "",
      x.nama_peminjam ?? "",
      x.kelas ?? "",
      x.nama_alat ?? "",
      x.kategori ?? "",
      x.jumlah ?? 0,
      getStatusEfektif(x) ?? "",
      hitungDenda(x) ?? 0,
    ]);

    const filename = `laporan_peminjaman_${filter.tanggalMulai}_sd_${filter.tanggalSelesai}.csv`;
    downloadCSV(filename, [header, ...rows]);
  }


  function handlePrint() {
    window.print();
  }

  const formatTanggal = (tgl) => {
    if (!tgl) return "-";
    const d = new Date(tgl);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };


  return (
    <div className="laporan-wrap">
      <div className="no-print header">
        <h2>Laporan Peminjaman Alat (Petugas)</h2>
        <p className="sub">Filter data, lihat ringkasan, unduh CSV, atau cetak laporan.</p>
      </div>

      <div className="no-print card">
        <div className="grid">
          <div className="field">
            <label>Tanggal Mulai</label>
            <input
              type="date"
              value={filter.tanggalMulai}
              onChange={(e) => updateFilter({ tanggalMulai: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Tanggal Selesai</label>
            <input
              type="date"
              value={filter.tanggalSelesai}
              onChange={(e) => updateFilter({ tanggalSelesai: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Status</label>
            <select value={filter.status} onChange={(e) => updateFilter({ status: e.target.value })}>
              <option value="SEMUA">Semua</option>
              <option value="DIPINJAM">Dipinjam</option>
              <option value="DIKEMBALIKAN">Dikembalikan</option>
              <option value="TERLAMBAT">Terlambat</option>
            </select>
          </div>

          <div className="field">
            <label>Kategori</label>
            <select
              value={filter.kategori}
              onChange={(e) => updateFilter({ kategori: e.target.value })}
            >
              {kategoriList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="field span-2">
            <label>Nama Peminjam</label>
            <input
              type="text"
              placeholder="Ketik nama peminjam... (contoh: agus)"
              value={filter.q}
              onChange={(e) => updateFilter({ q: e.target.value })}
            />

          </div>
        </div>

        <div className="actions">
          <button onClick={ambilLaporan} disabled={loading}>
            {loading ? "Memuat..." : "Refresh Data"}
          </button>
          <button onClick={handleExportCSV} disabled={loading || dataTersaring.length === 0}>
            Export CSV
          </button>
          <button onClick={handlePrint} disabled={dataTersaring.length === 0}>
            Cetak
          </button>
        </div>

        {error ? (
          <div className="error">
            ⚠️ {error}
            <div style={{ marginTop: 6, fontSize: 12 }}>
              Cek <b>API_URL</b> di atas file ini. Harus sama dengan endpoint yang dipakai Dashboard.
            </div>
          </div>
        ) : null}
      </div>

      <div className="card summary">
        <div>
          <div className="label">Total Transaksi</div>
          <div className="value">{ringkasan.totalTransaksi}</div>
        </div>
        <div>
          <div className="label">Total Item</div>
          <div className="value">{ringkasan.totalItem}</div>
        </div>
        <div>
          <div className="label">Dipinjam</div>
          <div className="value">{ringkasan.totalDipinjam}</div>
        </div>
        <div>
          <div className="label">Dikembalikan</div>
          <div className="value">{ringkasan.totalDikembalikan}</div>
        </div>
        <div>
          <div className="label">Terlambat</div>
          <div className="value">{ringkasan.totalTerlambat}</div>
        </div>
      </div>

      <div className="card">
        <div className="print-header only-print">
          <h3>Laporan Peminjaman Alat Olahraga</h3>
          <p>
            Periode: <b>{filter.tanggalMulai}</b> s/d <b>{filter.tanggalSelesai}</b> | Status:{" "}
            <b>{filter.status}</b> | Kategori: <b>{filter.kategori}</b>
          </p>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tgl Pinjam</th>
                <th>Tgl Kembali</th>
                <th>Peminjam</th>
                <th>Alat</th>
                <th>Kategori</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Denda</th>

              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 16 }}>
                    {loading ? "Memuat data..." : "Tidak ada data pada filter ini."}
                  </td>
                </tr>
              ) : (
                pageData.map((x, idx) => (
                  <tr key={x.id_pinjam || idx}>
                    <td>{x.id_pinjam || "-"}</td>
                    <td>{formatTanggal(x.tgl_pinjam)}</td>
                    <td>{formatTanggal(x.tgl_rencana_kembali)}</td>
                    <td>{x.nama_peminjam || "-"}</td>
                    <td>{x.nama_alat || "-"}</td>
                    <td>{x.kategori || "-"}</td>
                    <td style={{ textAlign: "center" }}>{x.jumlah ?? 0}</td>
                    <td>{getStatusEfektif(x) || "-"}</td>
                    <td>Rp {hitungDenda(x).toLocaleString("id-ID")}</td>

                  </tr>
                ))

              )}
            </tbody>
          </table>
        </div>

        <div className="no-print pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Prev
          </button>
          <span>
            Halaman <b>{page}</b> / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>

        <div className="only-print print-footer">
          <p>
            Dicetak pada: <b>{new Date().toLocaleString("id-ID")}</b>
          </p>
        </div>
      </div>
    </div>
  );
}
