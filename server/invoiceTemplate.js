function generateInvoiceHTML(data) {
  const itemsHTML = data.items.map((item, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#f5f3ff' : '#ffffff'};">
      <td style="padding: 10px;">${item.item}</td>
      <td style="padding: 10px; text-align: right;">${item.gstRate || 0}%</td>
      <td style="padding: 10px; text-align: right;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">₹${item.rate.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right;">₹${(item.quantity * item.rate).toFixed(2)}</td>
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
          background: #ffffff;
          font-size: 14px;
        }
        h1 {
          font-size: 36px;
          color: #7e22ce;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        h3 {
          font-size: 14px;
          color: #7e22ce;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .section {
          margin-bottom: 32px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        .invoice-info p {
          margin: 4px 0;
        }
        .invoice-info span {
          color: #6b7280;
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
          padding: 20px;
        }
        .billing-box p {
          margin: 4px 0;
          color: #334155;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 24px;
          border: 1px solid #ddd6fe;
        }
        table thead {
          background: #c4b5fd;
        }
        table th {
          color: #4c1d95;
          text-transform: uppercase;
          font-size: 12px;
          background: #7e22ce;
          color: white;
          padding: 10px;
          text-align: left;
        }
        table td {
          border-top: 1px solid #e5e7eb;
        }
        .totals-box {
          background: #f5f3ff;
          border: 1px solid #ddd6fe;
          padding: 16px;
          border-radius: 12px;
          margin-top: 24px;
          width: 300px;
          float: right;
        }
        .totals-box p {
          display: flex;
          justify-content: space-between;
          margin: 6px 0;
        }
        .totals-box .grand {
          border-top: 1px solid #ddd6fe;
          margin-top: 10px;
          padding-top: 10px;
          font-weight: bold;
          font-size: 16px;
          color: #7e22ce;
        }
        .bank-signature {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        .bank-info p {
          margin: 4px 0;
        }
        .signature p {
          text-align: right;
        }
        .terms {
          margin-top: 40px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>

      <!-- Header -->
     <!-- Header Section -->
<div class="header section">
  <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
    <div>
      <h1 style="
        font-size: 40px;
        color: #7e22ce;
        text-transform: uppercase;
        letter-spacing: -0.5px;
        margin-bottom: 12px;
        font-weight: 700;
      ">
        Invoice
      </h1>
      <div class="invoice-info" style="font-size: 14px; color: #1e293b;">
        <p><span style="color: #6b7280;">Invoice No:</span> <strong>#${data.invoiceNumber}</strong></p>
        <p><span style="color: #6b7280;">Invoice Date:</span> <strong>${data.date}</strong></p>
        <p><span style="color: #6b7280;">Due Date:</span> <strong>${data.dueDate}</strong></p>
      </div>
    </div>
    ${
      data.businessLogo
        ? `<div style="flex-shrink: 0;">
            <img src="${data.businessLogo}" alt="Business Logo" style="height: 80px; border-radius: 6px; border: 1px solid #ccc; margin-left: 20px;" />
          </div>`
        : ''
    }
  </div>
</div>
      <!-- Billing Info -->
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

      <!-- Table -->
      <table class="section">
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

      <!-- Totals -->
      <div class="totals-box">
        <p><span>Amount:</span> ₹${total.toFixed(2)}</p>
        ${data.igst ? `<p><span>IGST:</span> ₹${data.igst.toFixed(2)}</p>` : ''}
        ${data.cgst ? `<p><span>CGST:</span> ₹${data.cgst.toFixed(2)}</p>` : ''}
        ${data.sgst ? `<p><span>SGST:</span> ₹${data.sgst.toFixed(2)}</p>` : ''}
        ${data.discount ? `<p><span>Discount:</span> <span style="color:red;">-₹${data.discount.toFixed(2)}</span></p>` : ''}
        ${data.additionalCharges ? `<p><span>Additional Charges:</span> ₹${data.additionalCharges.toFixed(2)}</p>` : ''}
        <p class="grand"><span>Grand Total:</span> ₹${grandTotal.toFixed(2)}</p>
      </div>

      <!-- Bank + Signature -->
      <div class="bank-signature">
        <div class="bank-info">
          <h3>Bank Details</h3>
          <p><strong>Account Name:</strong> Animesh Pravinchandra Kudake</p>
          <p><strong>Account Number:</strong> 68025555438</p>
          <p><strong>IFSC:</strong> MAHB0000009</p>
          <p><strong>Bank:</strong> Bank Of Maharashtra</p>
          <p><strong>Account Type:</strong> Savings</p>
        </div>
        ${
          data.signature
            ? `<div class="signature">
                <p>Authorized Signatory</p>
                <img src="${data.signature}" style="height: 60px;" />
              </div>`
            : ''
        }
      </div>

      <!-- Terms -->
      ${data.terms ? `
        <div class="terms">
          <h3>Terms & Conditions</h3>
          <p>${data.terms.replace(/\n/g, '<br>')}</p>
        </div>` : ''}

    </body>
  </html>
  `;
}

module.exports = generateInvoiceHTML;
