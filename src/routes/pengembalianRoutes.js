const express = require("express");
const router = express.Router();
const pengembalianController = require("../controllers/pengembalianController");

router.get("/", pengembalianController.getPengembalian);
router.post("/", pengembalianController.kembalikanAlat);

module.exports = router;
