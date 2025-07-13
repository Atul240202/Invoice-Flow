const express = require("express");
const router = express.Router();
const { getMonthlyTrend } = require("../controllers/reportController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/monthly-trend", authMiddleware, getMonthlyTrend);

module.exports = router;
