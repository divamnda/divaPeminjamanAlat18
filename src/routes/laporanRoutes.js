const express = require("express");
const { getLaporanPeminjaman } = require("../controllers/laporanController");

const router = express.Router();
router.get("/", getLaporanPeminjaman);

module.exports = router;
