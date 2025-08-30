const express = require("express");
const puppeteer = require("puppeteer");
const Expense = require("../models/Expense");
const router = express.Router();
const { getMonthlyTrend } = require("../controllers/reportController");
const { getExpensesFiltered} = require("../controllers/expenseController");
const generateExpenseReportHTML = require("../utils/generateExpenseHTML");
const authMiddleware = require("../middlewares/authMiddleware");
const generateGSTR3BHTML = require("../utils/generateGSTR3BHTML");

const ExcelJS = require("exceljs");


router.get("/monthly-trend", authMiddleware, getMonthlyTrend);

router.post("/export-pdf", authMiddleware, async (req, res) => {
  try {
    const { from, to, type } = req.body;
    const userId = req.user._id;

    console.log("Export PDF for user:", userId);

    const expenses = await getExpensesFiltered(from, to, type, userId); 
    console.log({ from, to, type, userId, totalExpenses: expenses.length });


    const htmlContent = generateExpenseReportHTML({ expenses });

    const browser = await puppeteer.launch({
  headless: true,
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

router.post("/export-gstr3b-pdf", authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.body;
    const userId = req.user._id;

    // ✅ Fetch data from MongoDB
    const expenses = await Expense.find({
      user: userId,
      date: { $gte: new Date(from), $lte: new Date(to) }
    });

    const taxable = expenses.filter(e => e.gstPercent > 0).reduce((sum, e) => sum + e.amount, 0);
    const exempt = expenses.filter(e => e.gstPercent === 0).reduce((sum, e) => sum + e.amount, 0);
    const itc = expenses.filter(e => e.itcEligible).reduce((sum, e) => sum + e.itcAmount, 0);

    const html = generateGSTR3BHTML({
      from,
      to,
      data: {
        section_3_1: {
          a: taxable.toFixed(2),
          e: exempt.toFixed(2),
        },
        section_4: {
          eligibleITC: itc.toFixed(2),
        }
      }
    });

    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    await browser.close();

    // ✅ Set headers correctly
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="GSTR-3B-${from}_to_${to}.pdf"`);

    res.end(pdfBuffer); // ✅ Use .end for buffer, not .send
  } catch (err) {
    console.error("PDF export failed:", err);
    res.status(500).json({ message: "Failed to export GSTR-3B PDF" });
  }
});

router.post("/export-gstr3b-excel", authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.body;
    const userId = req.user._id;

    const expenses = await Expense.find({
      user: userId,
      date: { $gte: new Date(from), $lte: new Date(to) }
    });

    const taxable = expenses.filter(e => e.gstPercent > 0).reduce((sum, e) => sum + e.amount, 0);
    const exempt = expenses.filter(e => e.gstPercent === 0).reduce((sum, e) => sum + e.amount, 0);
    const itc = expenses.filter(e => e.itcEligible).reduce((sum, e) => sum + e.itcAmount, 0);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("GSTR-3B Summary");

    sheet.columns = [
      { header: "Section", key: "section", width: 15 },
      { header: "Description", key: "desc", width: 50 },
      { header: "Amount (₹)", key: "amount", width: 20 },
    ];

    sheet.addRow({ section: "3.1(a)", desc: "Outward taxable supplies", amount: taxable.toFixed(2) });
    sheet.addRow({ section: "3.1(e)", desc: "Exempted outward supplies", amount: exempt.toFixed(2) });
    sheet.addRow({ section: "4", desc: "Eligible ITC", amount: itc.toFixed(2) });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="GSTR-3B-${from}_to_${to}.xlsx"`);

    await workbook.xlsx.write(res); // ✅ write to stream directly
    res.end(); // ✅ end the response
  } catch (err) {
    console.error("Excel export failed:", err);
    res.status(500).json({ message: "Failed to export GSTR-3B Excel" });
  }
});

module.exports = router;