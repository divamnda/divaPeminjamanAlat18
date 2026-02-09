const db = require("../models/db");

exports.getLogAktivitas = (req, res) => {
  const sql = `
    SELECT id_log, aktivitas, tabel, waktu
    FROM log_aktivitas
    ORDER BY waktu DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(results);
  });
};
