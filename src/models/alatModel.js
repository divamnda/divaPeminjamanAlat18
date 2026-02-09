import db from "../config/db";
export const getAllAlat = (callback) =>{
    db.query("SELECT * FROM alat_olahraga", callback);
};

export const createAlat = (data, callback) => {
    const sql = "INSERT INTO alat_olahraga SET ?";
    db.query(sql, data, callback)
};