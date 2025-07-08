const express = require('express');
const dotenv = require('dotenv');
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const generateInvoiceHTML = require('./invoiceTemplate');
const fs = require('fs');

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pdfs', express.static(path.join(__dirname, 'public/pdfs')));


connectDB();

app.get("/", (req, res) => {
    res.send("api running..");
});

app.use('/api/auth', require('./routes/authRoutes'));

const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api/settings', settingsRoutes);

const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api/invoices', invoiceRoutes);
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const invoiceDir = path.join(__dirname, 'invoices');
if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir);
}


app.post('/generate-pdf', async (req, res) => {
  const invoiceData = req.body;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = generateInvoiceHTML(invoiceData);
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    const filename = `invoice-${invoiceData.invoiceNumber || Date.now()}.pdf`;
    const filepath = path.join(invoiceDir, filename);
    fs.writeFileSync(filepath, pdfBuffer);

   
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return res.send(pdfBuffer); // No JSON, just raw buffer
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
});
