const express = require('express');
const router = express.Router();
const peminjamanController = require('../controllers/peminjamanController');

router.get("/", peminjamanController.getAllPeminjaman);

router.post('/ajukan', peminjamanController.tambahPeminjaman); 
router.put('/setujui/:id', peminjamanController.setujuiPeminjaman);

router.post('/kembali', peminjamanController.kembalikanAlat);

router.put('/:id', peminjamanController.updatePeminjaman);
router.delete('/:id', peminjamanController.deletePeminjaman);


module.exports = router;
