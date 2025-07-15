const Expense = require("../models/Expense");


exports.createExpense = async (req, res) => {
    console.log(" createExpense called");
  try {
    const { amount, gstPercent, itcEligible } = req.body;

    const itcAmount =
      itcEligible && gstPercent
        ? (parseFloat(amount) * parseFloat(gstPercent)) / 100
        : 0;

    const files = req.files;

    for(const file of files){
        console.log("Received file:", file.originalname);
    }

    const expense = new Expense({
      ...req.body,
      user: req.user._id,
      itcAmount: itcAmount.toFixed(2),
      receipts: files.map((file) => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }))
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error("FULL CREATE EXPENSE ERROR:", error);
    res.status(500).json({ message: "Error creating expense", error });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { category, tags, gst } = req.query;

    const query = { user: req.user._id };

    if (category && category !== "all") query.category = category;
    if (tags && tags !== "all") query.tags = { $in: [tags] };
    if (gst === "gst") query.gstPercent = { $gt: 0 };
    if (gst === "non-gst") query.gstPercent = { $lte: 0 };

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { amount, gstPercent, itcEligible } = req.body;

    const itcAmount =
      itcEligible && gstPercent
        ? (parseFloat(amount) * parseFloat(gstPercent)) / 100
        : 0;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        ...req.body,
        itcAmount: itcAmount.toFixed(2),
      },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error updating expense", error });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error });
  }
};

exports.getRecurringExpenses = async (req, res) => {
  try {
    const recurring = await Expense.find({
      user: req.user._id,
      isRecurring: true,
    }).sort({ date: -1 });

    res.status(200).json(recurring);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recurring expenses", error });
  }
};

exports.getITCSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user._id,
      itcEligible: true,
      gstPercent: { $gt: 0 },
    });

    const totalITC = expenses.reduce((sum, e) => sum + e.itcAmount, 0);

    const grouped = {};
    expenses.forEach((e) => {
      const rate = e.gstPercent;
      grouped[rate] = (grouped[rate] || 0) + e.itcAmount;
    });

    const result = Object.entries(grouped).map(([rate, value]) => ({
      rate,
      amount: value.toFixed(2),
    }));

    res.status(200).json({ totalITC: totalITC.toFixed(2), breakdown: result });
  } catch (error) {
    res.status(500).json({ message: "Error fetching ITC summary", error });
  }
};

exports.getTopVendors = async (req, res) => {
  try {
    const vendors = await Expense.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$vendor",
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { amount: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json(
      vendors.map((v) => ({
        name: v._id,
        amount: v.amount,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendor summary", error });
  }
};

exports.getMonthlyTrend = async (req, res) => {
  try {
    const expenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          expenses: { $sum: "$amount" },
          itc: { $sum: "$itcAmount" },
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    const trend = expenses.map((e) => ({
      month: new Date(2000, e._id - 1).toLocaleString("default", {
        month: "short",
      }),
      expenses: e.expenses,
      itc: e.itc,
    }));

    res.status(200).json(trend);
  } catch (error) {
    res.status(500).json({ message: "Error generating trendline", error });
  }
};

exports.getExpensesFiltered = async (from, to, type, userId) => {
  const query = {
    date: {
      $gte: new Date(from),
      $lte: new Date(to),
    },
    user: userId,
  };

  if (type && type !== "all") {
    query.type = type;
  }

  const expenses = await Expense.find(query).sort({ date: -1 });
  return expenses;
};
