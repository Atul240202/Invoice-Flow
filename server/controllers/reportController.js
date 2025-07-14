const Invoice = require("../models/Invoice");
const Expense = require("../models/Expense");
const { format } = require("date-fns");

const getMonthlyTrend = async (req, res) => {
  try {
    const userId = req.user._id;

    const invoices = await Invoice.find({ user: userId, status: "Paid" }).lean();

    const expenses = await Expense.find({ user: userId }).lean();

    const months = ["Jan","Feb","Mar","Apr","May","Jun",
                    "Jul","Aug","Sep","Oct","Nov","Dec"];

    const monthMap = Object.fromEntries(
      months.map(m => [m, { month: m, income: 0, expenses: 0, itc: 0 }])
    );

    invoices.forEach((inv) => {
      if (!inv.invoiceDate || !inv.summary || !inv.summary.totalAmount) return;
      const month = format(new Date(inv.invoiceDate), "MMM");
      if (monthMap[month]) {
        monthMap[month].income += inv.summary.totalAmount;
      }
    });

    expenses.forEach((exp) => {
        if (!exp.date) return;
      const month = format(new Date(exp.date), "MMM");
      if (monthMap[month]) {
        monthMap[month].expenses += exp.amount;
        if (exp.itcEligible) {
          monthMap[month].itc += exp.itcAmount || 0;
        }
      }
    });

    const monthlyTrend = months.map((m) => monthMap[m]);

    res.json({ monthlyTrend });
  } catch (err) {
    console.error("Monthly Trend Error:", err);
    res.status(500).json({ message: "Failed to fetch monthly trend" });
  }
};

module.exports = { getMonthlyTrend };
