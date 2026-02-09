const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "peminjaman_alat_olahraga",
  port: 3306, 

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("Koneksi pool gagal:", err.message);
    console.log("Kode:", err.code);
    return;
  }
  console.log("Database terhubung (pool)!");
  connection.release();
});

module.exports = db;
