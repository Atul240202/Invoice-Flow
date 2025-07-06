const Invoice = require("../models/Invoice");

//create invoice
exports.createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      shipping,
      gstConfig,
      currency,
      items,
      summary,
      additionalOptions,
      status,
    } = req.body;

    const invoice = new Invoice({
      user: req.user._id,
      invoiceNumber,
      invoiceDate,
      dueDate,
      businessLogo: req.files['businessLogo'] ? req.files['businessLogo'][0].path : '',
      billFrom: JSON.parse(billFrom),
      billTo: JSON.parse(billTo),
      shipping: JSON.parse(shipping),
      gstConfig: JSON.parse(gstConfig),
      currency,
      items: JSON.parse(items),
      summary: JSON.parse(summary),
      additionalOptions: {
        ...JSON.parse(additionalOptions),
        attachments: req.files['attachments']?.map(file => file.path) || [],
      },
      status,
    });

    await invoice.save();
    res.status(201).json({ message: "Invoice created", invoice });
  } catch (error) {
    console.error("Error creating invoice:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get all invoices of user
exports.getUserInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoices", error: error.message });
  }
};

//get single Invoice
exports.getSingleInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Error fetching invoice", error: error.message });
  }
};

//update Invoice
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json({ message: "Invoice updated", invoice });
  } catch (error) {
    res.status(500).json({ message: "Error updating invoice", error: error.message });
  }
};

//delete Invoice 
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json({ message: "Invoice deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting invoice", error: error.message });
  }
};