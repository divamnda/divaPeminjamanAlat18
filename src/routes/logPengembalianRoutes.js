const express = require("express");
const router = express.Router();
const {
  getLogPengembalian,
  setujuiPengembalian, 
} = require("../controllers/logPengembalianController");

router.get("/", getLogPengembalian);

router.put("/:id_pengembalian/setujui", setujuiPengembalian);

module.exports = router;
