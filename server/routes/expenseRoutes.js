const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const expenseController = require("../controllers/expenseController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });



router.use(authMiddleware);

router.post(
  "/",
  (req, res, next) => {
    console.log("Request hit the route");
    next();
  },
  upload.array("receipts"),
  (err, req, res, next) => {
    console.error("Multer error:", err);
    return res.status(500).json({ message: "Multer error", error: err.message });
  },
  expenseController.createExpense
);

router.get("/", expenseController.getExpenses);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);

router.get("/summary/itc", expenseController.getITCSummary);
router.get("/summary/vendors", expenseController.getTopVendors);
router.get("/summary/trend", expenseController.getMonthlyTrend);
router.get("/recurring", expenseController.getRecurringExpenses);

module.exports = router;