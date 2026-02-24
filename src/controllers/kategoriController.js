const db = require("../models/db");

const getKategori = (req, res) => {
  const sql = "SELECT * FROM kategori";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

const tambahKategori = (req, res) => {
  const { nama_kategori, stok } = req.body;

  const stokFix = Math.max(1, Number(stok || 1));

  const sql = "INSERT INTO kategori (nama_kategori, stok) VALUES (?, ?)";
  db.query(sql, [nama_kategori, stokFix], (err, result) => {
    if (err) {
      console.log("SQL ERROR tambahKategori:", err);
      return res.status(500).json({ message: "Gagal menyimpan", error: err.sqlMessage });
    }
    res.json({ message: "Kategori berhasil ditambahkan" });
  });
};

const updateKategori = (req, res) => {
  const { id } = req.params;
  const { nama_kategori, stok } = req.body;

  const stokFix = Math.max(1, Number(stok || 1));

  const sql = `
    UPDATE kategori
    SET nama_kategori = ?, stok = ?
    WHERE id = ?
  `;

  db.query(sql, [nama_kategori, stokFix, id], (err, result) => {
    if (err) {
      console.error("SQL ERROR FULL:", err);
      return res.status(500).json({
        message: err.sqlMessage || err.message,
        sql: err.sql,
        sqlState: err.sqlState
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    return res.json({ message: "Berhasil update" });
  });
};





const deleteKategori = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM kategori WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("SQL DELETE ERROR:", err);

      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(400).json({
          message: "Kategori tidak bisa dihapus karena masih digunakan oleh data alat/peminjaman."
        });
      }

      return res.status(500).json({ message: err.sqlMessage || err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    return res.json({ message: "Berhasil dihapus" });
  });
};




module.exports = {
  getKategori,
  tambahKategori,
  updateKategori,
  deleteKategori
};
