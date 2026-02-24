const express = require("express");
const router = express.Router();

const alatController = require("../controllers/alatController");

router.get("/", alatController.getAllAlat);                
router.post("/", alatController.tambahAlat);                
router.put("/:id", alatController.updateAlat);              
router.delete("/:id", alatController.deleteAlat);          
router.patch("/:id/tambah-stok", alatController.tambahStok);

module.exports = router;
