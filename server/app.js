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
const authMiddleware = require("./middlewares/authMiddleware");

dotenv.config();



const app = express();

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

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

const baseUrl = process.env.BASE_URL || "http://localhost:5000";

app.post('/api/invoices/:id/download-pdf', authMiddleware, async (req, res) => {

  try {
    
    const invoiceId = req.params.id;

    // Fetch invoice with populated client/company data if stored separately
    const invoice = await Invoice.findById(invoiceId)
      .populate('billFrom')
      .populate('billTo');

    if (!invoice || !invoice.billFrom || !invoice.billTo) {
      return res.status(400).json({ error: "Invalid invoice or client/company info missing." });
    }

    // Format invoice data for the HTML template
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.invoiceDate?.toLocaleDateString("en-IN") || '',
      dueDate: invoice.dueDate?.toLocaleDateString("en-IN") || '',
      items: invoice.items || [],
      gstRate: invoice.gstRate || 0,
     igst: invoice.summary?.igst || 0,
cgst: invoice.summary?.cgst || 0,
sgst: invoice.summary?.sgst || 0,

      discount: invoice.discount || 0,
      additionalCharges: invoice.additionalCharges || 0,
       businessLogo: invoice.businessLogo ? `${baseUrl}/${invoice.businessLogo}` : '',
 terms: invoice.terms || '',
  additionalOptions: {
    ...invoice.additionalOptions,
    qrImage: invoice.additionalOptions?.qrImage
      ? `${baseUrl}/${invoice.additionalOptions.qrImage}`
      : '',
    signature: invoice.additionalOptions?.signature
      ? `${baseUrl}/${invoice.additionalOptions.signature}`
      : '',
  },
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
      },
      bankDetails: invoice.bankDetails || {},
      
    };

    // Launch Puppeteer with safer deployment options
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    
    

    const htmlContent = generateInvoiceHTML(invoiceData);
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });
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
