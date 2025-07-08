function generateInvoiceHTML(data) {
  const itemsHTML = data.items.map((item) => `
    <tr>
      <td>${item.item}</td>
      <td style="text-align: right;">${item.gstRate || 0}%</td>
      <td style="text-align: right;">${item.quantity}</td>
      <td style="text-align: right;">₹${item.rate.toFixed(2)}</td>
      <td style="text-align: right;">₹${(item.quantity * item.rate).toFixed(2)}</td>
    </tr>
  `).join('');

  const total = data.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const grandTotal = total + (data.igst || 0) + (data.cgst || 0) + (data.sgst || 0) + (data.additionalCharges || 0) - (data.discount || 0);

  return `
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            padding: 48px;
            color: #1e293b;
            background: #fff;
            font-size: 14px;
          }
          h1 {
            font-size: 34px;
            color: #7e22ce;
            margin-bottom: 8px;
          }
          h3 {
            font-weight: 600;
            margin-bottom: 6px;
            color: #7e22ce;
          }
          .section {
            margin-bottom: 32px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 24px;
          }
          .invoice-info p {
            margin: 4px 0;
            font-size: 14px;
          }
          .invoice-info strong {
            color: #6b7280;
            font-weight: 500;
            margin-right: 4px;
          }
          .billing {
            display: flex;
            gap: 24px;
          }
          .billing-box {
            flex: 1;
            background: #f5f3ff;
            border: 1px solid #ddd6fe;
            border-radius: 12px;
            padding: 16px;
          }
          .billing-box p {
            margin: 4px 0;
            color: #374151;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 24px;
            font-size: 13px;
            background: #f5f3ff;
            border: 1px solid #ddd6fe;
            border-radius: 8px;
            overflow: hidden;
          }
          .table th {
            background: #ede9fe;
            color: #7e22ce;
            padding: 10px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            border-bottom: 1px solid #ddd6fe;
          }
          .table td {
            padding: 10px;
            border: 1px solid #e5e7eb;
          }
          .totals-signature-qr {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
          }
          .totals-box {
            flex: 1;
            background: #f5f3ff;
            padding: 16px;
            border: 1px solid #ddd6fe;
            border-radius: 12px;
          }
          .totals-box p {
            margin: 6px 0;
            display: flex;
            justify-content: space-between;
          }
          .totals-box .grand {
            font-size: 18px;
            font-weight: bold;
            color: #7e22ce;
            margin-top: 10px;
            border-top: 1px solid #ddd6fe;
            padding-top: 10px;
          }
          .signature-placeholder {
            flex: 1;
            text-align: center;
            padding-top: 40px;
            font-size: 13px;
            color: #6b7280;
            border-top: 1px dashed #bbb;
            margin-top: 50px;
          }
          .qr-code-box {
            flex: 1;
            text-align: center;
          }
          .qr-code-box img {
            max-width: 120px;
            margin-bottom: 6px;
          }
          .bank-signature {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .bank-info p {
            margin: 4px 0;
            font-size: 13px;
          }
          .signature p {
            text-align: right;
            margin-bottom: 6px;
          }
          .terms {
            margin-top: 40px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .terms p {
            margin: 6px 0;
          }
        </style>
      </head>
      <body>

        <!-- Header Section -->
        <div class="header section">
          <div>
            <h1>Invoice</h1>
            <div class="invoice-info">
              <p><strong>Invoice No:</strong> #${data.invoiceNumber}</p>
              <p><strong>Invoice Date:</strong> ${data.date}</p>
              <p><strong>Due Date:</strong> ${data.dueDate}</p>
            </div>
          </div>
          ${data.businessLogo ? `<img src="${data.businessLogo}" style="height: 80px; border-radius: 6px;" />` : ''}
        </div>

        <!-- Billing Section -->
        <div class="billing section">
          <div class="billing-box">
            <h3>Billed By</h3>
            <p><strong>${data.billFromData.businessName}</strong></p>
            <p>${data.billFromData.address}, ${data.billFromData.city}, ${data.billFromData.state}, India - ${data.billFromData.pincode}</p>
            ${data.billFromData.gstin ? `<p>GSTIN: ${data.billFromData.gstin}</p>` : ''}
            ${data.billFromData.pan ? `<p>PAN: ${data.billFromData.pan}</p>` : ''}
          </div>
          <div class="billing-box">
            <h3>Billed To</h3>
            <p><strong>${data.billToData.businessName}</strong></p>
            <p>${data.billToData.address}, ${data.billToData.city}, ${data.billToData.state}, India - ${data.billToData.pincode}</p>
            ${data.billToData.gstin ? `<p>GSTIN: ${data.billToData.gstin}</p>` : ''}
          </div>
        </div>

        <!-- Items Table -->
        <table class="table section">
          <thead>
            <tr>
              <th>Item</th>
              <th>GST %</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <!-- Totals + QR + Signature -->
        <div class="totals-signature-qr">
          <div class="totals-box">
            <p><span>Amount:</span> ₹${total.toFixed(2)}</p>
            ${data.igst ? `<p><span>IGST:</span> ₹${data.igst.toFixed(2)}</p>` : ''}
            ${data.cgst ? `<p><span>CGST:</span> ₹${data.cgst.toFixed(2)}</p>` : ''}
            ${data.sgst ? `<p><span>SGST:</span> ₹${data.sgst.toFixed(2)}</p>` : ''}
            ${data.discount ? `<p><span>Discount:</span> <span style="color: red;">-₹${data.discount.toFixed(2)}</span></p>` : ''}
            ${data.additionalCharges ? `<p><span>Additional Charges:</span> ₹${data.additionalCharges.toFixed(2)}</p>` : ''}
            <p class="grand"><span>Grand Total:</span> ₹${grandTotal.toFixed(2)}</p>
          </div>

          <div class="qr-code-box">
            <h3>Scan to Pay</h3>
            ${data.qrCode ? `<img src="${data.qrCode}" alt="QR Code" />` : '<p>No QR Code Provided</p>'}
          </div>

          <div class="signature-placeholder">
            <p>Receiver’s Signature</p>
          </div>
        </div>

        <!-- Bank & Optional Signature -->
        <div class="bank-signature section">
          <div class="bank-info">
            <h3>Bank Details</h3>
            <p><strong>Account Name:</strong> Animesh Pravinchandra Kudake</p>
            <p><strong>Account Number:</strong> 68025555438</p>
            <p><strong>IFSC:</strong> MAHB0000009</p>
            <p><strong>Bank:</strong> Bank Of Maharashtra</p>
            <p><strong>Account Type:</strong> Savings</p>
          </div>
          ${data.signature ? `
            <div class="signature">
              <p>Authorized Signatory</p>
              <img src="${data.signature}" style="height: 60px;" />
            </div>
          ` : ''}
        </div>

        <!-- Terms -->
        ${data.terms ? `
          <div class="terms">
            <h3>Terms and Conditions</h3>
            <p>${data.terms.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}

      </body>
    </html>
  `;
}

module.exports = generateInvoiceHTML;
