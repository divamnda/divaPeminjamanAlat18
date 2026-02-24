const db = require('../models/db');


exports.getDashboard = (req, res) => {
  const data = {};
  const nama = (req.query.nama || "").trim(); 
  db.query("SELECT COUNT(*) AS total FROM alat_olahraga WHERE stok > 0", (err, result) => {
    if (err) return res.status(500).json(err);
    data.alatTersedia = result[0].total;

    const whereNama = nama ? "WHERE LOWER(p.nama_peminjam) = LOWER(?)" : "";
    const paramsNama = nama ? [nama] : [];

    db.query(
      `
      SELECT COUNT(*) AS total
      FROM peminjaman p
      ${whereNama ? whereNama + " AND p.status = 'Dipinjam'" : "WHERE p.status = 'Dipinjam'"}
      `,
      paramsNama,
      (err, result) => {
        if (err) return res.status(500).json(err);
        data.sedangDipinjam = result[0].total;

        db.query(
          `
          SELECT COUNT(*) AS total
          FROM peminjaman p
          ${whereNama ? whereNama + " AND p.status = 'Dikembalikan'" : "WHERE p.status = 'Dikembalikan'"}
          `,
          paramsNama,
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
              ${whereNama}
              ORDER BY p.tgl_pinjam DESC
              `,
              paramsNama,
              (err, orders) => {
                if (err) return res.status(500).json(err);
                data.orders = orders;
                return res.json(data);
              }
            );
          }
        );
      }
    );
  });
};


