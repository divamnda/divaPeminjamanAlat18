const db = require("../models/db");

exports.getPengembalian = (req, res) => {
  const sql = `
  SELECT 
  pg.id_pengembalian,
  p.nama_peminjam,
  a.nama_alat,
  pg.tanggal_dikembalikan,
  pg.kondisi_alat,
  pg.denda
FROM pengembalian pg
JOIN peminjaman p ON pg.id_peminjaman = p.id_pinjam
JOIN alat_olahraga a ON p.id_alat = a.id_alat
ORDER BY pg.id_pengembalian DESC

  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result); 
  });
};

exports.kembalikanAlat = (req, res) => {
  const { id_peminjaman, kondisi_alat, id_petugas } = req.body;

  if (!id_peminjaman) {
    return res.status(400).json({ message: "id_peminjaman wajib diisi" });
  }

  db.query(
    "SELECT status, tgl_rencana_kembali, id_alat, jumlah FROM peminjaman WHERE id_pinjam = ?",
    [id_peminjaman],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Data peminjaman tidak ditemukan" });
      }

      const pinjam = rows[0];

      if (pinjam.status !== "Dipinjam") {
        return res.status(400).json({ message: "Status bukan Dipinjam" });
      }

      db.query(
        "SELECT GREATEST(DATEDIFF(CURDATE(), DATE(?)), 0) AS telat_hari",
        [pinjam.tgl_rencana_kembali],
        (err2, diffRows) => {
          if (err2) return res.status(500).json(err2);

          const telatHari = diffRows[0]?.telat_hari || 0;
          const denda = telatHari * 1000;
          const kondisi = kondisi_alat || "baik";

          db.query(
            "UPDATE peminjaman SET status='Dikembalikan', tgl_kembali=NOW() WHERE id_pinjam=?",
            [id_peminjaman],
            (err3) => {
              if (err3) return res.status(500).json(err3);

              db.query(
                `INSERT INTO pengembalian (id_peminjaman, tanggal_dikembalikan, kondisi_alat, denda, id_petugas)
                 VALUES (?, NOW(), ?, ?, ?)`,
                [id_peminjaman, kondisi, denda, id_petugas || null],
                (err4) => {
                  if (err4) return res.status(500).json(err4);

                  db.query(
                    "UPDATE alat_olahraga SET stok = stok + ? WHERE id_alat = ?",
                    [pinjam.jumlah, pinjam.id_alat],
                    (err5) => {
                      if (err5) return res.status(500).json(err5);

                      db.query(
                        `INSERT INTO log_pengembalian (id_pinjam, id_alat, jumlah, kondisi, tanggal)
                         VALUES (?, ?, ?, ?, NOW())`,
                        [id_peminjaman, pinjam.id_alat, pinjam.jumlah, kondisi],
                        (err6) => {
                          if (err6) return res.status(500).json(err6);

                          res.json({
                            message: "Pengembalian berhasil",
                            telat_hari: telatHari,
                            denda,
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};
