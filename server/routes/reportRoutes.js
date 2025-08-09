const express = require("express");
const puppeteer = require("puppeteer");
const router = express.Router();
const { getMonthlyTrend } = require("../controllers/reportController");
const { getExpensesFiltered} = require("../controllers/expenseController");
const generateExpenseReportHTML = require("../utils/generateExpenseHTML");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/monthly-trend", authMiddleware, getMonthlyTrend);

router.post("/export-pdf", authMiddleware, async (req, res) => {
  try {
    const { from, to, type } = req.body;
    const userId = req.user._id;

    console.log("✅ Export PDF for user:", userId);

    const expenses = await getExpensesFiltered(from, to, type, userId); 
    console.log({ from, to, type, userId, totalExpenses: expenses.length });


    const htmlContent = generateExpenseReportHTML({ expenses });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=Expense_Report.pdf",
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF Export Failed:", err);
    res.status(500).json({ message: "Failed to export report" });
  }
});

module.exports = router;