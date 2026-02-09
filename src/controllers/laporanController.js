const db = require("../models/db");

exports.getLaporanPeminjaman = (req, res) => {
  const sql = `
    SELECT 
      p.id_pinjam,
      p.tgl_pinjam,
      p.tgl_rencana_kembali,
      p.tgl_kembali,
      p.nama_peminjam,
      ao.nama_alat,
      k.nama_kategori AS kategori,
      p.jumlah,
      p.status,
      COALESCE(pg.denda, 0) AS denda
    FROM peminjaman p
    JOIN alat_olahraga ao ON p.id_alat = ao.id_alat
    LEFT JOIN kategori k ON ao.kategori_id = k.id
    LEFT JOIN pengembalian pg ON pg.id_peminjaman = p.id_pinjam
    ORDER BY p.id_pinjam DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error laporan:", err);
      return res.status(500).json({
        message: "Gagal ambil laporan",
        error: err.sqlMessage
      });
    }
    res.json(result);
  });
};

