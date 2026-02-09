const db = require("../models/db");

const getKategori = (req, res) => {
  const sql = "SELECT * FROM kategori";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

const tambahKategori = (req, res) => {
  const { nama_kategori } = req.body;
  const sql = "INSERT INTO kategori (nama_kategori) VALUES (?)";
  db.query(sql, [nama_kategori], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Kategori berhasil ditambahkan" });
  });
};

const updateKategori = (req, res) => {
  const { id } = req.params;
  const { nama_kategori } = req.body;

  const sql = "UPDATE kategori SET nama_kategori=? WHERE id_kategori=?";
  db.query(sql, [nama_kategori, id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Kategori berhasil diupdate" });
  });
};

const hapusKategori = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM kategori WHERE id_kategori=?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Kategori berhasil dihapus" });
  });
};



module.exports = {
  getKategori,
  tambahKategori,
  updateKategori,
  hapusKategori
};
