const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const { isToday, isThisWeek, isThisMonth, isThisQuarter } = require("date-fns");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const safeParse = (json) => {
  if (!json) return {};
  if (typeof json === "object") return json; // already parsed
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
};

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
      bankDetails,
      upiDetails
    } = req.body;

const parsedBillTo = safeParse(billTo);
    const parsedShipping = safeParse(shipping);
    const parsedGstConfig = safeParse(gstConfig);
    const parsedItems = safeParse(items);
    const parsedSummary = safeParse(summary);
    const parsedAdditionalOptions = safeParse(additionalOptions);
const parsedBankDetails = safeParse(bankDetails);
 const parsedUpiDetails = safeParse(upiDetails);

let clientId = null;

    if (billToDetail) {
      const existingClient = await Client.findOne({
        _id: billToDetail,
        user: req.user._id,
      });

      if (existingClient) {
        clientId = existingClient._id;
      }
    }

    const invoice = new Invoice({
      user: req.user._id,
      billToDetail: clientId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      businessLogo: req.files['businessLogo'] ? req.files['businessLogo'][0].path : '',
      billFrom: safeParse(billFrom),
      billTo: parsedBillTo,
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
      bankDetails: parsedBankDetails,
      upiDetails: parsedUpiDetails,
      status: status || "Draft",
    });

  const hasCompleteManualBillTo = (bill) => {
  const required = ["businessName", "address", "city", "state", "pincode"];
  return (
    bill &&
    required.every((k) => typeof bill[k] === "string" && bill[k].trim())
  );
};

if (saveAsClient === "true" && !clientId && hasCompleteManualBillTo(parsedBillTo)) {
  const existing = await Client.findOne({
    name: parsedBillTo.businessName,
    user: req.user._id,
  });

  if (!existing) {
    const newClient = await Client.create({
      user: req.user._id,
      name: parsedBillTo.businessName || "",
      email: parsedBillTo.email || "",
      phone: parsedBillTo.phone || "",
      gstNumber: parsedBillTo.gstin || "",
      pan: parsedBillTo.pan || "",
      address: parsedBillTo.address || "",
      city: parsedBillTo.city || "",
      state: parsedBillTo.state || "",
      pincode: parsedBillTo.pincode || "",
      country: parsedBillTo.country || "India",
      status: "Active",
    });

    invoice.billToDetail = newClient._id;
  } else {
    invoice.billToDetail = existing._id;
  }
}


if (!invoice.billToDetail && !hasCompleteManualBillTo(invoice.billTo)) {
  return res.status(400).json({
    message:
      "Missing or incomplete recipient info. Select an existing client or fill every Bill‑To field.",
  });
}


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
      status,
      bankDetails,
      upiDetails
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
        signature: req.files?.signature?.[0]?.path || '',
      };
    }
    if (bankDetails) updatedFields.bankDetails = JSON.parse(bankDetails);
if (upiDetails) updatedFields.upiDetails = JSON.parse(upiDetails);


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

const axios = require("axios"); // already imported above

exports.sendInvoiceEmail = async (req, res) => {
  const { id } = req.params;
  const { to, pdfUrl } = req.body;

  try {
    // Download the PDF from your server
    const pdfRes = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const pdfBase64 = Buffer.from(pdfRes.data, "binary").toString("base64");

    // Send email via Brevo
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "ApnaProject", email: "kudakemruganksha@gmail.com" },
        to: [{ email: to }],
        subject: "Your Invoice",
        htmlContent: "<p>Dear customer, please find your invoice attached.</p>",
        attachment: [
          {
            name: `invoice-${id}.pdf`,
            content: pdfBase64,
          },
        ],
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email", details: err.message });
  }
};