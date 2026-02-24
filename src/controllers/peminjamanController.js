const db = require('../models/db');

exports.getAllPeminjaman = (req, res) => {
  const sql = `
    SELECT 
      p.id_pinjam,
      p.nama_peminjam,
      p.no_hp,
      p.alamat,
      a.nama_alat,
      p.jumlah,
      p.tgl_pinjam,
      p.tgl_rencana_kembali,
      p.tgl_kembali,
      p.status
    FROM peminjaman p
    JOIN alat_olahraga a ON p.id_alat = a.id_alat
    ORDER BY p.id_pinjam DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.tambahPeminjaman = (req, res) => {
  console.log("BODY MASUK /peminjaman/ajukan:", req.body);

  const {
    nama_peminjam,
    no_hp,
    alamat,
    id_alat,
    jumlah,
    tgl_pinjam,
    tgl_rencana_kembali
  } = req.body;

  if (!nama_peminjam) {
    return res.status(400).json({ message: "Nama peminjam wajib diisi" });
  }

  if (!no_hp) {
    return res.status(400).json({ message: "No HP wajib diisi" });
  }

  if (!alamat) {
    return res.status(400).json({ message: "Alamat wajib diisi" });
  }

  if (!id_alat) {
    return res.status(400).json({ message: "Alat wajib dipilih" });
  }

  if (!jumlah || jumlah <= 0) {
    return res.status(400).json({ message: "Jumlah harus lebih dari 0" });
  }

  if (!tgl_pinjam) {
    return res.status(400).json({ message: "Tanggal pinjam wajib diisi" });
  }

  if (!tgl_rencana_kembali) {
    return res.status(400).json({ message: "Tanggal rencana kembali wajib diisi" });
  }

  console.log("DATA VALID:", {
    nama_peminjam,
    no_hp,
    alamat,
    id_alat,
    jumlah,
    tgl_pinjam,
    tgl_rencana_kembali
  });

  db.query(
    "SELECT stok FROM alat_olahraga WHERE id_alat = ?",
    [id_alat],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) {
        return res.status(404).json({ message: "Alat tidak ditemukan" });
      }

      if (result[0].stok < jumlah) {
        return res.status(400).json({ message: "Stok tidak mencukupi" });
      }

      const sqlInsert = `
        INSERT INTO peminjaman
        (nama_peminjam, no_hp, alamat, id_alat, jumlah, tgl_pinjam, tgl_rencana_kembali, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu')
      `;

      db.query(
        sqlInsert,
        [
          nama_peminjam,
          no_hp,
          alamat,
          id_alat,
          jumlah,
          tgl_pinjam,
          tgl_rencana_kembali
        ],
        (err2, result2) => {
          if (err2) return res.status(500).json(err2);

          db.query(
            `INSERT INTO log_aktivitas (aktivitas, tabel, data_id)
             VALUES (?, ?, ?)`,
            [
              `Mengajukan peminjaman atas nama ${nama_peminjam}`,
              "peminjaman",
              result2.insertId
            ]
          );

          res.json({
            message: "Pengajuan berhasil, menunggu persetujuan petugas"
          });
        }
      );
    }
  );
};



exports.kembalikanAlat = (req, res) => {
  const id_pinjam = req.body.id_pinjam ?? req.body.id_peminjaman;
  const kondisi_alat = req.body.kondisi_alat ?? req.body.kondisi ?? "baik";
  const tgl_kembali = new Date();

  db.query(
    "SELECT id_alat, jumlah, status, tgl_rencana_kembali FROM peminjaman WHERE id_pinjam = ?",
    [id_pinjam],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0)
        return res.status(404).json({ message: "Data peminjaman tidak ditemukan" });

      const pinjam = result[0];

      if (pinjam.status !== "Dipinjam") {
        return res.status(400).json({
          message: `Tidak bisa dikembalikan. Status sekarang: ${pinjam.status}`,
        });
      }

      const { id_alat, jumlah, tgl_rencana_kembali } = pinjam;

      db.query(
        "SELECT GREATEST(DATEDIFF(CURDATE(), DATE(?)), 0) AS telat_hari",
        [tgl_rencana_kembali],
        (errDiff, diffRows) => {
          if (errDiff) return res.status(500).json(errDiff);

          const telatHari = diffRows[0]?.telat_hari || 0;
          const denda = telatHari * 1000;

          db.query(
            "UPDATE peminjaman SET tgl_kembali = ?, status = 'Dikembalikan' WHERE id_pinjam = ?",
            [tgl_kembali, id_pinjam],
            (err2) => {
              if (err2) return res.status(500).json(err2);

              db.query(
                "UPDATE alat_olahraga SET stok = stok + ? WHERE id_alat = ?",
                [jumlah, id_alat],
                (err3) => {
                  if (err3) return res.status(500).json(err3);

                  db.query(
                    `INSERT INTO pengembalian (id_peminjaman, tanggal_dikembalikan, kondisi_alat, denda, id_petugas)
                     VALUES (?, NOW(), ?, ?, NULL)`,
                    [id_pinjam, kondisi_alat, denda],
                    (err4) => {
                      if (err4) return res.status(500).json(err4);

                      return res.json({
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
};


exports.setujuiPeminjaman = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT p.id_pinjam, p.id_alat, p.jumlah, p.status, a.stok
    FROM peminjaman p
    JOIN alat_olahraga a ON p.id_alat = a.id_alat
    WHERE p.id_pinjam = ?
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length === 0) return res.status(404).json({ message: "Data peminjaman tidak ditemukan" });

    const row = rows[0];

    if (row.status !== "Menunggu") {
      return res.status(400).json({ message: `Tidak bisa disetujui. Status sekarang: ${row.status}` });
    }

    if (row.stok < row.jumlah) {
      return res.status(400).json({ message: "Stok tidak mencukupi untuk disetujui" });
    }

    db.query(
      "UPDATE peminjaman SET status = 'Dipinjam' WHERE id_pinjam = ?",
      [id],
      (err2) => {
        if (err2) return res.status(500).json(err2);

        db.query(
          "UPDATE alat_olahraga SET stok = stok - ? WHERE id_alat = ?",
          [row.jumlah, row.id_alat],
          (err3) => {
            if (err3) return res.status(500).json(err3);

            db.query(
              `INSERT INTO log_aktivitas (aktivitas, tabel, data_id)
               VALUES (?, ?, ?)`,
              [`Menyetujui peminjaman id ${id}`, "peminjaman", id]
            );

            res.json({ message: "Peminjaman berhasil disetujui" });
          }
        );
      }
    );
  });
};



exports.updatePeminjaman = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const sql = `
    UPDATE peminjaman SET
      nama_peminjam = ?,
      no_hp = ?,
      alamat = ?,
      id_alat = ?,
      jumlah = ?,
      tgl_pinjam = ?,
      tgl_rencana_kembali = ?
    WHERE id_pinjam = ?
  `;

  db.query(sql, [
    data.nama_peminjam,
    data.no_hp,
    data.alamat,
    data.id_alat,
    data.jumlah,
    data.tgl_pinjam,
    data.tgl_rencana_kembali,
    id
  ], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Data peminjaman berhasil diupdate' });
  });
};

exports.deletePeminjaman = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT status FROM peminjaman WHERE id_pinjam = ?",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0) return res.status(404).json({ message: "Data tidak ditemukan" });

      if (rows[0].status === "Dipinjam") {
        return res.status(400).json({ message: "Masih dipinjam, tidak bisa dihapus" });
      }

      db.query("DELETE FROM peminjaman WHERE id_pinjam = ?", [id], (err2) => {
        if (err2) return res.status(500).json(err2);
        res.json({ message: "Data peminjaman berhasil dihapus" });
      });
    }
  );
};



