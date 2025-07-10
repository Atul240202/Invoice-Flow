const express = require('express');
const dotenv = require('dotenv');
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const generateInvoiceHTML = require('./invoiceTemplate');
const fs = require('fs');
const Invoice = require('./models/Invoice');

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


connectDB();

app.get("/", (req, res) => {
    res.send("api running..");
});

app.use('/api/auth', require('./routes/authRoutes'));

const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api/settings', settingsRoutes);

const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api/invoices', invoiceRoutes);

const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clients', clientRoutes);

app.post('/api/invoices/:id/download-pdf', async (req, res) => {
  try {
    const invoiceId = req.params.id;

    const invoice = await Invoice.findById(invoiceId)
      .populate("billFrom")
      .populate("billTo");

    if (!invoice || !invoice.billFrom || !invoice.billTo) {
      return res.status(400).json({ error: "Invalid invoice or client/company info missing." });
    }

    // 💡 Format the data properly
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.invoiceDate.toLocaleDateString("en-IN"),
      dueDate: invoice.dueDate.toLocaleDateString("en-IN"),
      items: invoice.items,
      gstRate: invoice.gstRate,
      igst: invoice.igst,
      cgst: invoice.cgst,
      sgst: invoice.sgst,
      discount: invoice.discount,
      additionalCharges: invoice.additionalCharges,
      businessLogo: invoice.businessLogo,
      signature: invoice.signature,
      qrCode: invoice.qrCode,
      terms: invoice.terms,

      billFromData: {
        businessName: invoice.billFrom.businessName,
        address: invoice.billFrom.address,
        city: invoice.billFrom.city,
        state: invoice.billFrom.state,
        pincode: invoice.billFrom.pincode,
        gstin: invoice.billFrom.gstin,
        pan: invoice.billFrom.pan,
      },
      billToData: {
        businessName: invoice.billTo.businessName,
        address: invoice.billTo.address,
        city: invoice.billTo.city,
        state: invoice.billTo.state,
        pincode: invoice.billTo.pincode,
        gstin: invoice.billTo.gstin,
      }
    };

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = generateInvoiceHTML(invoiceData);
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    const filename = `invoice-${invoice.invoiceNumber || invoice._id}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
