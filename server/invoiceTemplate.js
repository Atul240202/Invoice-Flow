function generateInvoiceHTML(data) {
  const itemsHTML = data.items.map((item, idx) => `
    <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td>${item.item}</td>
      <td class="text-right">${item.gstRate || 0}%</td>
      <td class="text-right">${item.quantity}</td>
      <td class="text-right">₹${item.rate.toFixed(2)}</td>
      <td class="text-right">₹${(item.quantity * item.rate).toFixed(2)}</td>
    </tr>
  `).join('');

  const total = data.items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
  const grandTotal = total +
    (Number(data.igst) || 0) +
    (Number(data.cgst) || 0) +
    (Number(data.sgst) || 0) +
    (Number(data.additionalCharges) || 0) -
    (Number(data.discount) || 0);

  return `
  <html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', sans-serif;
        background: #fff;
        color: #0f172a;
        padding: 40px;
        max-width: 900px;
        margin: auto;
      }
      h1 {
        font-size: 48px;
        color: #7e22ce;
        text-transform: uppercase;
        margin: 0 0 8px;
        font-weight: bold;
      }
      .text-gray { color: #64748b; }
      .header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 20px;
      }
      .logo {
        max-height: 80px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        padding: 4px;
        background: white;
      }
      .billing {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 24px;
      }
      .card {
        background: #faf5ff;
        border: 1px solid #e9d5ff;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .card h3 {
        font-size: 12px;
        text-transform: uppercase;
        font-weight: bold;
        color: #7e22ce;
        margin-bottom: 6px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 24px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
      }
      thead {
        background: #e9d5ff;
        color: #6b21a8;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      th, td {
        padding: 10px 14px;
        font-size: 14px;
        border-bottom: 1px solid #e5e7eb;
      }
      .row-even { background: #faf5ff; }
      .row-odd { background: white; }
      .text-right { text-align: right; }

      /* Totals & QR Section */
      .totals-section {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-top: 24px;
        flex-wrap: wrap;
      }
      .qr-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
      }
      .qr-box img {
        height: 128px;
        width: 128px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .totals-box {
        flex: 1;
        max-width: 300px;
        background: #faf5ff;
        border: 1px solid #e9d5ff;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .totals-box p {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        margin: 4px 0;
      }
      .totals-box .label {
        color: #64748b;
      }
      .totals-divider {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }
      .totals-divider hr {
        flex: 1;
        border: none;
        border-top: 1px solid #d8b4fe;
      }
      .totals-divider span {
        padding: 0 8px;
        font-size: 12px;
        font-weight: 600;
        color: #7e22ce;
      }
      .grand {
        border-top: 1px solid #e5e7eb;
        margin-top: 8px;
        padding-top: 8px;
        font-weight: bold;
        font-size: 16px;
        color: #6b21a8;
        text-align: right;
      }

      /* Bank & Signature Section */
      .bank-signature {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-top: 40px;
        flex-wrap: wrap;
      }
      .bank-details {
        flex: 1;
        min-width: 250px;
        background: #faf5ff;
        border: 1px solid #e9d5ff;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .signature-plain {
        flex: 1;
        text-align: center;
        min-width: 250px;
      }
      .signature-plain img {
        height: 64px;
        margin-top: 8px;
      }

      /* Terms */
      .terms {
        margin-top: 40px;
        border-top: 1px solid #e5e7eb;
        padding-top: 16px;
        font-size: 13px;
        color: #475569;
        line-height: 1.5;
      }
      .terms h3 {
        font-size: 12px;
        text-transform: uppercase;
        font-weight: bold;
        color: #7e22ce;
        margin-bottom: 6px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Invoice</h1>
        <p class="text-gray">Invoice No: <strong>#${data.invoiceNumber}</strong></p>
        <p class="text-gray">Invoice Date: <strong>${data.date}</strong></p>
        <p class="text-gray">Due Date: <strong>${data.dueDate}</strong></p>
      </div>
      ${data.businessLogo ? `<div><img src="${data.businessLogo}" class="logo" /></div>` : ''}
    </div>

    <div class="billing">
      <div class="card">
        <h3>Billed By</h3>
        <p class="font-semibold">${data.billFromData.businessName}</p>
        <p>${data.billFromData.address}, ${data.billFromData.city}, ${data.billFromData.state}, India - ${data.billFromData.pincode}</p>
        ${data.billFromData.gstin ? `<p>GSTIN: ${data.billFromData.gstin}</p>` : ''}
        ${data.billFromData.pan ? `<p>PAN: ${data.billFromData.pan}</p>` : ''}
      </div>
      <div class="card">
        <h3>Billed To</h3>
        <p class="font-semibold">${data.billToData.businessName}</p>
        <p>${data.billToData.address}, ${data.billToData.city}, ${data.billToData.state}, India - ${data.billToData.pincode}</p>
        ${data.billToData.gstin ? `<p>GSTIN: ${data.billToData.gstin}</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-right">GST %</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsHTML}</tbody>
    </table>

    <div class="totals-section">
      ${data.additionalOptions?.qrImage ? `
      <div class="qr-box">
        <p class="text-gray">Scan to Pay</p>
        <img src="${data.additionalOptions.qrImage}" />
      </div>
      ` : ''}
      <div class="totals-box">
        <div class="totals-divider">
          <hr>
          <span>TOTAL</span>
          <hr>
        </div>
        <p><span class="label">Amount:</span> ₹${total.toFixed(2)}</p>
        ${data.igst ? `<p><span class="label">IGST:</span> ₹${Number(data.igst).toFixed(2)}</p>` : ''}
        ${data.sgst ? `<p><span class="label">SGST:</span> ₹${Number(data.sgst).toFixed(2)}</p>` : ''}
        ${data.cgst ? `<p><span class="label">CGST:</span> ₹${Number(data.cgst).toFixed(2)}</p>` : ''}
        ${data.discount ? `<p><span class="label">Discount:</span> -₹${Number(data.discount).toFixed(2)}</p>` : ''}
        ${data.additionalCharges ? `<p><span class="label">Additional Charges:</span> ₹${Number(data.additionalCharges).toFixed(2)}</p>` : ''}
        <p class="grand">Grand Total: ₹${grandTotal.toFixed(2)}</p>
      </div>
    </div>

    <div class="bank-signature">
      <div class="bank-details">
        <h3>Bank Details</h3>
        ${data.bankDetails?.accountHolderName ? `<p>Account Name: ${data.bankDetails?.accountHolderName}</p>` : ''}
        ${data.bankDetails?.accountNumber ? `<p>Account Number: ${data.bankDetails?.accountNumber}</p>` : ''}
        ${data.bankDetails?.ifsc ? `<p>IFSC: ${data.bankDetails?.ifsc}</p>` : ''}
        ${data.bankDetails?.bankName ? `<p>Bank: ${data.bankDetails?.bankName}</p>` : ''}
        ${data.bankDetails?.accountType ? `<p>Account Type: ${data.bankDetails?.accountType}</p>` : ''}
      </div>
      ${data.additionalOptions?.signature ? `
      <div class="signature-plain">
        <img src="${data.additionalOptions.signature}" />
      </div>
      ` : ''}
    </div>

    ${data.additionalOptions?.terms ? `
      <div class="terms">
        <h3>Terms & Conditions</h3>
        <p>${data.additionalOptions.terms.replace(/\n/g, '<br>')}</p>
      </div>
    ` : ''}
  </body>
  </html>
  `;
}

module.exports = generateInvoiceHTML;
