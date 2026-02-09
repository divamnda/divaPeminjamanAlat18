const express = require("express");
const router = express.Router();
const { getLogAktivitas } = require("../controllers/logController");

router.get("/", getLogAktivitas);

module.exports = router;
