const db = require('../models/db');

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }

  const sql = `
    SELECT id_user, nama, username, role
    FROM users
    WHERE username = ? AND password = ?
  `;

  db.query(sql, [username, password], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    res.json({
      message: 'Login berhasil',
      user: result[0]
    });
  });
};


exports.logout = (req, res) => {
  res.json({ message: 'Logout berhasil' });
};
