const express = require('express');
const cors = require('cors'); 
const app = express();

app.use(cors());
app.use(express.json());

const alatRoutes = require('./routes/alatRoutes');
const peminjamanRoutes = require('./routes/peminjamanRoutes');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/authRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes'); 
const logPengembalianRoutes = require("./routes/logPengembalianRoutes");
const logRoutes = require("./routes/logRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use("/pengembalian", require("./routes/pengembalianRoutes"));
const laporanRoutes = require('./routes/laporanRoutes');

app.use('/alat', alatRoutes);
app.use('/peminjaman', peminjamanRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/kategori', kategoriRoutes);
app.use("/log-pengembalian", logPengembalianRoutes);
app.use("/log-aktivitas", logRoutes);
app.use('/api', dashboardRoutes);
app.use("/laporan", laporanRoutes); 

app.get('/', (req, res) => {
  res.send('API jalan');
});


app.listen(3000, () => {
    console.log('Server jalan di port 3000');
});
