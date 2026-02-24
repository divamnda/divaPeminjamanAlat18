const db = require("../models/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_SECRET = "supersecretkey"; 
const SALT_ROUNDS = 10;

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi" });
  }

  const sql = `
    SELECT id_user, nama, username, role, password
    FROM users
    WHERE username = ?
    LIMIT 1
  `;

  db.query(sql, [username], async (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length === 0) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const user = result[0];
    const dbPass = String(user.password || "");

    const isBcrypt =
      dbPass.startsWith("$2a$") || dbPass.startsWith("$2b$") || dbPass.startsWith("$2y$");

    try {
      let ok = false;

      if (isBcrypt) {
        ok = await bcrypt.compare(password, dbPass);
      } else {
        ok = password === dbPass;

        if (ok) {
          const newHash = await bcrypt.hash(password, SALT_ROUNDS);
          db.query("UPDATE users SET password=? WHERE id_user=?", [newHash, user.id_user]);
        }
      }

      if (!ok) {
        return res.status(401).json({ message: "Username atau password salah" });
      }

      const token = jwt.sign(
        {
          id_user: user.id_user,
          username: user.username,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      delete user.password;

      return res.json({
        message: "Login berhasil",
        token,
        user,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Terjadi kesalahan saat login" });
    }
  });
};

exports.logout = (req, res) => {
  res.json({ message: "Logout berhasil" });
};
