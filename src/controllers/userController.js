const db = require('../models/db');

exports.getAllUsers = (req, res) => {
  db.query(
    "SELECT id_user, nama, username, role FROM users",
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE id_user = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User berhasil dihapus" });
  });
};

exports.login = (req, res) => {
  const { username, password, role } = req.body;

  const query = `
    SELECT id_user, nama, username, role
    FROM users
    WHERE username = ? AND password = ? AND role = ?
  `;

  db.query(query, [username, password, role], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Username, password, atau role salah"
      });
    }

    res.json({
      user: results[0]
    });
  });
};
