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
          width: 300px;
          margin-left: auto; /* Push totals to right */
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
        .bank-details {
          background-color: #f5f3ff;
          border: 1px solid #ddd6fe;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
          width: 100%;
        }
        .bank-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          color: #1e293b;
        }
        .signature-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-top: 20px;
        }
        .signature-img {
          height: 64px;
          margin-top: 0.5rem;
        }
        .terms {
          margin-top: 40px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        .totals-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          gap: 0.75rem;
        }
        .totals-divider hr {
          flex-grow: 1;
          border: none;
          border-top: 1px solid #d8b4fe;
        }
        .totals-label {
          padding: 0 0.5rem;
          font-weight: 600;
          color: #7e22ce;
          font-size: 0.875rem;
        }
        .bank-signature-container {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>

      <!-- Header -->
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

      <!-- Totals Section (Right-aligned) -->
      <div class="totals-box">
        <div class="totals-divider">
          <hr />
          <span class="totals-label">TOTAL</span>
          <hr />
        </div>

        <p><span>Amount:</span> ₹${total.toFixed(2)}</p>

        ${data.igst > 0 ? `<p><span>IGST:</span> ₹${data.igst.toFixed(2)}</p>` : ''}
        ${data.cgst > 0 ? `<p><span>CGST:</span> ₹${data.cgst.toFixed(2)}</p>` : ''}
        ${data.sgst > 0 ? `<p><span>SGST:</span> ₹${data.sgst.toFixed(2)}</p>` : ''}
        ${data.discount > 0 ? `<p><span>Discount:</span> <span style="color:red;">-₹${data.discount.toFixed(2)}</span></p>` : ''}
        ${data.additionalCharges > 0 ? `<p><span>Additional Charges:</span> ₹${data.additionalCharges.toFixed(2)}</p>` : ''}

        <p class="grand"><span>Grand Total:</span> ₹${grandTotal.toFixed(2)}</p>
      </div>

      <!-- Bank Details (Left-aligned below totals) -->
      <div class="bank-signature-container">
        <div class="bank-details">
          <h3>Bank Details</h3>
          <div class="bank-grid">
            ${data.accountHolderName ? `<p><strong>Account Name:</strong> ${data.accountHolderName}</p>` : ''}
            ${data.accountNumber ? `<p><strong>Account Number:</strong> ${data.accountNumber}</p>` : ''}
            ${data.ifsc ? `<p><strong>IFSC:</strong> ${data.ifsc}</p>` : ''}
            ${data.bankName ? `<p><strong>Bank:</strong> ${data.bankName}</p>` : ''}
            ${data.accountType ? `<p><strong>Account Type:</strong> ${data.accountType}</p>` : ''}
          </div>
        </div>

        <!-- Signature (Right-aligned) -->
        ${
          data.signature
            ? `<div class="signature-container">
                <p class="signature-label">Authorized Signatory</p>
                <img src="${data.signature}" alt="Signature" class="signature-img" />
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