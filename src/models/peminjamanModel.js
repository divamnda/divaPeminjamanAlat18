import db from "../config/db";

export const getAllPeminjaman = (callback) => {
    const sql = `
    SELECT p.*, a.nama_alat
    FROM peminjaman p
    JOIN alat_olahraga a ON p.id_alat = a.id_alat
    `;
    db.query(sql, callback);
};

export const createPeminjaman = (data, callback) => {
    db.query("INSERT INTO peminjaman SET ?", data, callback);
};     