// routes/expenses.js or routes/reports.js
const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const generateExpenseReportHTML = require("../utils/generateExpenseHTML"); // your custom HTML template

router.post("/export-pdf", async (req, res) => {
  try {
    const { from, to, type } = req.body;

    // Fetch expenses from DB based on filters
    const expenses = await getExpensesFiltered(from, to, type); // implement this
    const htmlContent = generateExpenseReportHTML({ expenses });

    // Launch Puppeteer
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
      "Content-Disposition": "attachment; filename=ExpenseReport.pdf",
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF Export Failed:", err);
    res.status(500).json({ message: "Failed to export report" });
  }
});

module.exports = router;
