const db = require('../models/db');

exports.getDashboard = (req, res) => {
  const data = {};

  db.query(
    "SELECT COUNT(*) AS total FROM alat_olahraga WHERE stok > 0",
    (err, result) => {
      if (err) return res.status(500).json(err);
      data.alatTersedia = result[0].total;

      db.query(
        "SELECT COUNT(*) AS total FROM peminjaman WHERE status = 'Dipinjam'",
        (err, result) => {
          if (err) return res.status(500).json(err);
          data.sedangDipinjam = result[0].total;

          db.query(
            "SELECT COUNT(*) AS total FROM peminjaman WHERE status = 'Dikembalikan'",
            (err, result) => {
              if (err) return res.status(500).json(err);
              data.selesai = result[0].total;

              db.query(
                `
                SELECT 
                  p.id_pinjam,
                  p.nama_peminjam,
                  a.nama_alat,
                  p.tgl_pinjam,
                  p.status
                FROM peminjaman p
                JOIN alat_olahraga a ON p.id_alat = a.id_alat
                ORDER BY p.tgl_pinjam DESC
                `,
                (err, orders) => {
                  if (err) return res.status(500).json(err);
                  data.orders = orders;
                  res.json(data);
                }
              );
            }
          );
        }
      );
    }
  );
};

