const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const { isToday, isThisWeek, isThisMonth, isThisQuarter } = require("date-fns");

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
      billToDetail,
      saveAsClient,
    } = req.body;

    const safeParse = (json) => {
  try {
    return JSON.parse(json);
  } catch {
    return {}; 
  }
};

const parsedSummary = safeParse(summary);
    const invoice = new Invoice({
      user: req.user._id,
      billToDetail: billToDetail,
      invoiceNumber,
      invoiceDate,
      dueDate,
      businessLogo: req.files['businessLogo'] ? req.files['businessLogo'][0].path : '',
      billFrom: safeParse(billFrom),
      billTo: safeParse(billTo),
      shipping: safeParse(shipping),
      gstConfig: safeParse(gstConfig),
      currency,
      items: safeParse(items),
      summary: parsedSummary,
      amount: parsedSummary?.totalAmount || 0,
      additionalOptions: {
        ...safeParse(additionalOptions),
        attachments: req.files['attachments']?.map(file => file.path) || [],
        qrImage: req.files['qrImage']?.[0]?.path || '',
        signature: req.files['signature']?.[0]?.path || '',
      },
      status: status || "Draft",
    });

    await invoice.save();
  /*
    if (saveAsClient === 'true' && parsedBillTo?.email) {
  const existingClient = await Client.findOne({
    email: parsedBillTo.email,
    user: req.user._id,
  });

  if (!existingClient) {
    const fullAddress = `${parsedBillTo.address || ""}, ${parsedBillTo.city || ""}, ${parsedBillTo.state || ""} - ${parsedBillTo.pincode || ""}`;

    await Client.create({
      user: req.user._id,
      name: parsedBillTo.businessName || "",
      email: parsedBillTo.email,
      phone: parsedBillTo.phone || "",
      address: fullAddress.trim(),
      gstNumber: parsedBillTo.gstin || "",
      company: parsedBillTo.businessName || "", 
      status: "Active", 
    });
  }
} */

    res.status(201).json({ message: "Invoice created", invoice });
  } catch (error) {
    console.error("Error creating invoice:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get all invoices of user
exports.getUserInvoices = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query; 
   // console.log("Fetching invoices for user:", userId);
    const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });
   // console.log("Found invoices:", invoices);
   if (!date || date === "all") {
      return res.status(200).json({ invoices });
    }

    const filtered = invoices.filter(inv => {
      const invDate = new Date(inv.invoiceDate);
      switch (date) {
        case "today":
          return isToday(invDate);
        case "week":
          return isThisWeek(invDate);
        case "month":
          return isThisMonth(invDate);
        case "quarter":
          return isThisQuarter(invDate);
        default:
          return true;
      }
    });

    res.status(200).json({invoices: filtered});
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
      status
    } = req.body;

    const updatedFields = {};

    if (invoiceNumber) updatedFields.invoiceNumber = invoiceNumber;
    if (invoiceDate) updatedFields.invoiceDate = invoiceDate;
    if (dueDate) updatedFields.dueDate = dueDate;
    if (currency) updatedFields.currency = currency;
    if (status) updatedFields.status = status;

    if (billFrom) updatedFields.billFrom = JSON.parse(billFrom);
    if (billTo) updatedFields.billTo = JSON.parse(billTo);
    if (shipping) updatedFields.shipping = JSON.parse(shipping);
    if (gstConfig) updatedFields.gstConfig = JSON.parse(gstConfig);
    if (items) updatedFields.items = JSON.parse(items);
    if (summary) updatedFields.summary = JSON.parse(summary);
    if (additionalOptions) {
      updatedFields.additionalOptions = {
        ...JSON.parse(additionalOptions),
        attachments: req.files?.attachments?.map(file => file.path) || [],
        qrImage: req.files?.qrImage?.[0]?.path || '',
      };
    }

    if (req.files?.businessLogo) {
      updatedFields.businessLogo = req.files.businessLogo[0].path;
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updatedFields },
      { new: true }
    );

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json({ message: "Invoice updated", invoice });

  } catch (error) {
    console.error("Error updating invoice:", error.message);
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