const express = require('express');
const dotenv = require('dotenv');
const connectDB = require("./config/db");

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.send("api running..");
});

app.use('/api/auth', require('./routes/authRoutes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));