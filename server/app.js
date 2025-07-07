const express = require('express');
const dotenv = require('dotenv');
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.get("/", (req, res) => {
    res.send("api running..");
});

app.use('/api/auth', require('./routes/authRoutes'));

const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api/settings', settingsRoutes);

const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api/invoices', invoiceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));