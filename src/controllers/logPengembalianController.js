const db = require("../models/db");

exports.getLogPengembalian = (req, res) => {
  const sql = `
    SELECT
      pg.id_pengembalian AS id_log,
      p.nama_peminjam,
      a.nama_alat,
      p.jumlah,
      pg.kondisi_alat AS kondisi,
      pg.status_pengembalian AS status_pengembalian,
      DATE_FORMAT(pg.tanggal_dikembalikan, '%d/%m/%Y') AS tanggal
    FROM pengembalian pg
    JOIN peminjaman p ON pg.id_peminjaman = p.id_pinjam
    JOIN alat_olahraga a ON p.id_alat = a.id_alat
    ORDER BY pg.tanggal_dikembalikan DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.setujuiPengembalian = (req, res) => {
  const { id_pengembalian } = req.params;

  const status = req.body?.status_pengembalian || "disetujui";

  const sql = `
    UPDATE pengembalian
    SET status_pengembalian = ?
    WHERE id_pengembalian = ?
  `;

  db.query(sql, [status, id_pengembalian], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data pengembalian tidak ditemukan" });
    }

    res.json({
      message: "Pengembalian berhasil disetujui",
      id_pengembalian: Number(id_pengembalian),
      status_pengembalian: status,
    });
  });
};



