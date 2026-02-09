const db = require('../models/db');

exports.getLogAktivitas = (req, res) => {
  db.query(
    "SELECT * FROM log_aktivitas ORDER BY waktu DESC",
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};
