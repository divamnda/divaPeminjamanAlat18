const db = require('../models/db');

exports.getAllAlat = (req, res) => {
  const sql = `
    SELECT 
      alat_olahraga.id_alat,
      alat_olahraga.nama_alat,
      alat_olahraga.stok,
      alat_olahraga.kondisi,
      alat_olahraga.kategori_id, 
      kategori.nama_kategori
    FROM alat_olahraga
    LEFT JOIN kategori ON alat_olahraga.kategori_id = kategori.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL ERROR:', err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
};

exports.tambahAlat = (req, res) => {
  const { nama_alat, stok, kondisi, kategori_id } = req.body;
  const userId = req.user?.id || null;

  db.query(
    "INSERT INTO alat_olahraga (nama_alat, stok, kondisi, kategori_id) VALUES (?, ?, ?, ?)",
    [nama_alat, stok, kondisi, kategori_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      db.query(
        `INSERT INTO log_aktivitas (user_id, aktivitas, tabel, data_id, waktu)
         VALUES (?, ?, ?, ?, NOW())`,
        [userId, `Menambah alat: ${nama_alat}`, "alat_olahraga", result.insertId]
      );

      res.json({ message: "Alat berhasil ditambahkan" });
    }
  );
};


exports.updateAlat = (req, res) => {
  const { id } = req.params;
  const { nama_alat, stok, kondisi, kategori_id } = req.body;

  if (!kategori_id) {
    return res.status(400).json({ message: "Kategori wajib diisi" });
  }

  const query = `
    UPDATE alat_olahraga
    SET nama_alat = ?, stok = ?, kondisi = ?, kategori_id = ?
    WHERE id_alat = ?
  `;

  db.query(query, [nama_alat, stok, kondisi, kategori_id, id], (err, result) => {
  if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    db.query(
    "INSERT INTO log_aktivitas (aktivitas, tabel, data_id) VALUES (?, ?, ?)",
    [`Mengedit alat ID ${id}`, "alat_olahraga", id]
  );

    res.json({ message: "Alat berhasil diupdate" });
  });
};

exports.tambahStok = (req, res) => {
  const { id } = req.params;
  const { jumlah } = req.body;

  const jumlahFix = Math.max(1, Number(jumlah || 1)); 

  const sql = `
    UPDATE alat_olahraga
    SET stok = stok + ?
    WHERE id_alat = ?
  `;

  db.query(sql, [jumlahFix, id], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage || err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Alat tidak ditemukan" });
    }

    db.query(
      "INSERT INTO log_aktivitas (aktivitas, tabel, data_id) VALUES (?, ?, ?)",
      [`Menambah stok alat ID ${id} (+${jumlahFix})`, "alat_olahraga", id]
    );

    return res.json({ message: "Stok berhasil ditambah" });
  });
};



exports.deleteAlat = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM peminjaman WHERE id_alat = ?", [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length > 0) {
      return res.status(400).json({ message: "Alat masih dipinjam, tidak bisa dihapus" });
    }

    db.query("DELETE FROM alat_olahraga WHERE id_alat = ?", [id], (err) => {
  if (err) return res.status(500).json(err);

       db.query(
    "INSERT INTO log_aktivitas (aktivitas, tabel, data_id) VALUES (?, ?, ?)",
    [`Menghapus alat ID ${id}`, "alat_olahraga", id]
  );

      res.json({ message: "Alat berhasil dihapus" });
    });
  });
};
