const db = require("../models/db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

exports.getAllUsers = (req, res) => {
  db.query("SELECT id_user, nama, username, role FROM users", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.createUser = (req, res) => {
  const { nama, username, password, role } = req.body;

  if (!nama || !username || !password || !role) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  db.query(
    "SELECT id_user FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length > 0) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }

      try {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        db.query(
          "INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)",
          [nama, username, passwordHash, role],
          (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ message: "User berhasil ditambahkan" });
          }
        );
      } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Gagal hash password" });
      }
    }
  );
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { nama, username, password, role } = req.body;

  if (!nama || !username || !role) {
    return res.status(400).json({ message: "Nama, username, dan role wajib diisi" });
  }

  db.query(
    "SELECT id_user FROM users WHERE username = ? AND id_user != ?",
    [username, id],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length > 0) {
        return res.status(409).json({ message: "Username sudah digunakan" });
      }

      if (password && password.trim() !== "") {
        try {
          const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

          db.query(
            "UPDATE users SET nama=?, username=?, password=?, role=? WHERE id_user=?",
            [nama, username, passwordHash, role, id],
            (err2, result) => {
              if (err2) return res.status(500).json(err2);
              if (result.affectedRows === 0)
                return res.status(404).json({ message: "User tidak ditemukan" });

              res.json({ message: "User berhasil diupdate" });
            }
          );
        } catch (e) {
          console.error(e);
          return res.status(500).json({ message: "Gagal hash password" });
        }
      } else {
        db.query(
          "UPDATE users SET nama=?, username=?, role=? WHERE id_user=?",
          [nama, username, role, id],
          (err2, result) => {
            if (err2) return res.status(500).json(err2);
            if (result.affectedRows === 0)
              return res.status(404).json({ message: "User tidak ditemukan" });

            res.json({ message: "User berhasil diupdate" });
          }
        );
      }
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
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi" });
  }

  db.query(
    "SELECT id_user, nama, username, role, password FROM users WHERE username = ? LIMIT 1",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });

      if (results.length === 0) {
        return res.status(401).json({ message: "Username atau password salah" });
      }

      const user = results[0];
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
        return res.json({
          message: "Login berhasil",
          user: {
            id_user: user.id_user,
            nama: user.nama,
            username: user.username,
            role: user.role,
          },
        });
      } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Terjadi kesalahan saat login" });
      }
    }
  );
};
