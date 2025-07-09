const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

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

    const invoice = new Invoice({
      user: req.user._id,
      billToDetail: billToDetail,
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
        qrImage: req.files['qrImage']?.[0]?.path || '',
        signature: req.files['signature']?.[0]?.path || '',
      },
      status,
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

    const updatedFields = {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom: JSON.parse(billFrom),
      billTo: JSON.parse(billTo),
      shipping: JSON.parse(shipping),
      gstConfig: JSON.parse(gstConfig),
      currency,
      items: JSON.parse(items),
      summary: JSON.parse(summary),
      additionalOptions: {
        ...JSON.parse(additionalOptions),
        attachments: req.files?.attachments?.map(file => file.path) || [],
         qrImage: req.files?.qrImage?.[0]?.path || '',
      },
      status
    };

    if (req.files?.businessLogo) {
      updatedFields.businessLogo = req.files.businessLogo[0].path;
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updatedFields,
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


/*exports.generateInvoicePDF  = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const url = `http://localhost:3000/invoice/${invoiceId}/print`; // React invoice print route
    const filePath = path.join(__dirname, `../public/pdfs/invoice-${invoiceId}.pdf`);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle0",
    });

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return res.status(200).json({ message: "PDF generated", pdfUrl: `/pdfs/invoice-${invoiceId}.pdf` });
  } catch (error) {
    console.error("PDF generation failed:", error);
     res.send("PDF would be generated here");
  }
};*/
