const express = require("express");
const router = express.Router();
const {
  getKategori,
  tambahKategori,
  updateKategori,
  hapusKategori
} = require("../controllers/kategoriController");

router.get("/", getKategori);
router.post("/", tambahKategori);
router.put("/:id", updateKategori); 
router.delete("/:id", hapusKategori);

module.exports = router;
