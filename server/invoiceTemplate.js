function generateInvoiceHTML(data) {
  // tolerate different prop names used in app vs export
  

  const bank = data.bankDetails || data.bankingDetails || {};
  const qrImage = data.qrImage 
              || data.qrImageUrl 
              || data?.additionalOptions?.qrImage 
              || null;

  const signature = (data.signature || data.additionalOptions?.signature) ?? null;
  const notes = (data.notes ?? data.Notes) || "";

  const TW = {
    // colors
    purple50:   "#faf5ff",
    purple200: "#e9d5ff",
    purple300: "#d8b4fe",
    purple700: "#7e22ce",
    purple900: "#581c87",
    gray200:    "#e5e7eb",
    gray300:    "#d1d5db",
    gray500:    "#6b7280",
    gray600:    "#4b5563",
    gray700:    "#374151",
    slate800:   "#1e293b",
    slate900:   "#0f172a",
  };

  const itemsHTML = (data.items || []).map((item, idx) => `
    <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="px-4 py-3 text-left">${item.item}</td>
      <td class="px-4 py-3 text-right">${item.gstRate || 0}%</td>
      <td class="px-4 py-3 text-right">${item.quantity}</td>
      <td class="px-4 py-3 text-right">₹${Number(item.rate ?? 0).toFixed(2)}</td>
      <td class="px-4 py-3 text-right">₹${(Number(item.quantity ?? 0) * Number(item.rate ?? 0)).toFixed(2)}</td>
    </tr>
  `).join('');

  const total = (data.items || []).reduce((s, i) => s + Number(i.quantity ?? 0) * Number(i.rate ?? 0), 0);
  const grandTotal = total
    + Number(data.igst || 0)
    + Number(data.cgst || 0)
    + Number(data.sgst || 0)
    + Number(data.additionalCharges || 0)
    - Number(data.discount || 0);

    console.log("buisness logo", data.businessLogo);

    const hasQR = Boolean(qrImage);

  return `
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Invoice #${data.invoiceNumber || ""}</title>
    <style>
      /* --- base & container (Card) --- */
      :root { --radius-xl: 0.75rem; --radius-2xl: 1rem; }
      * { box-sizing: border-box; }
      body {
        font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        color: ${TW.slate900};
        background: #fff;
        margin: 0;
        padding: 1rem;
      }
      .outer {
        max-width: 64rem; /* Tailwind max-w-5xl */
        margin: 0 auto;
        padding: 1rem;    /* px-4 */
      }
      .card {
        border: 1px solid ${TW.gray200};
        border-radius: var(--radius-2xl); /* rounded-2xl */
        box-shadow: 0 10px 15px rgba(0,0,0,.05), 0 4px 6px rgba(0,0,0,.05); /* shadow-lg */
        background: #fff;
        overflow: hidden;
      }
      .card-header {
        padding: 1rem 1rem .5rem 1rem; /* pb-2 */
        border-bottom: 1px solid ${TW.gray200};
      }
      .card-content {
        padding: 2rem 1rem 2rem 1rem; /* pt-8 + consistent side paddings */
        color: ${TW.slate800};
      }

      /* --- header title + meta --- */
      .hdr {
        display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;
        padding-bottom: 1.5rem; border-bottom: 1px solid ${TW.gray200};
      }
      .hdr h1 {
        margin: 0 0 .75rem 0;
        font-size: 3rem; /* text-5xl */
        font-weight: 800;
        text-transform: uppercase;
        color: ${TW.purple700};
        letter-spacing: -0.025em; /* tracking-tight */
      }
      .meta { font-size: .875rem; line-height: 1.35; }
      .meta .label { color: ${TW.gray500}; }

      .logo-wrap { margin-top: 1rem; text-align: center; }
      .logo-wrap img {
        height: 100px; width: auto;
        border: 1px solid ${TW.gray300};
        border-radius: .5rem;
        display: inline-block;
      }
      .logo-name { font-size: .75rem; color: #16a34a; margin: 0; }

      /* --- billing boxes --- */
      .billing-grid {
        display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-top: 1.5rem;
      }
      @media (min-width: 768px) {
        .billing-grid { grid-template-columns: 1fr 1fr; }
      }
      .bill-card {
        background: ${TW.purple50};
        border: 1px solid ${TW.purple200};
        border-radius: var(--radius-xl);
        padding: 1.25rem; /* p-5 */
        box-shadow: 0 1px 3px rgba(0,0,0,.05);
        font-size: .875rem;
      }
      .bill-card h3 {
        margin: 0 0 .5rem 0;
        text-transform: uppercase;
        font-weight: 700;
        color: ${TW.purple700};
      }
      .bill-card .title { font-weight: 600; color: ${TW.slate900}; }

      /* --- table --- */
      .table-wrap {
        border: 1px solid ${TW.gray200};
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,.05);
        margin-top: 1.5rem;
      }
      table { width: 100%; border-collapse: collapse; }
      thead {
        background: ${TW.purple200};
        color: ${TW.purple900};
        text-transform: uppercase;
        font-size: .75rem;
        letter-spacing: .05em; /* tracking-wider */
      }
      th, td { padding: .75rem 1rem; font-size: .875rem; }
      th { text-align: left; }
      th.text-right, td.text-right { text-align: right; }
      .row-even { background: ${TW.purple50}; color: ${TW.slate800}; }
      .row-odd  { background: #fff; color: ${TW.slate800}; }

      /* --- totals + QR row --- */
      .totals-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end; /* was space-between */
  align-items: flex-start;
  margin-top: 1.5rem;
}
.totals-row.with-qr {
  justify-content: space-between; /* only if QR is present */
}

      .qr-box { text-align: center; min-width: 180px; }
      .qr-box img {
        max-width: 160px; background: #fff; border: 1px solid ${TW.gray200};
        border-radius: .5rem; padding: 4px;
      }

      .totals-box {
        background: ${TW.purple50};
        border: 1px solid ${TW.purple200};
        border-radius: var(--radius-xl);
        padding: 1.25rem;
        width: 100%;
        max-width: 28rem; /* matches a compact card */
        box-shadow: 0 1px 3px rgba(0,0,0,.05);
      }
      /* Responsive widths to mirror w-full md:w-1/2 lg:w-1/3 */
      @media (min-width: 768px) { .totals-box { max-width: 50%; } }
      @media (min-width: 1024px) { .totals-box { max-width: 33.3333%; } }

      .total-divider { display: flex; align-items: center; justify-content: space-between; margin-bottom: .5rem; gap: .5rem; }
      .total-divider hr { flex: 1; border: none; border-top: 1px solid ${TW.purple300}; }
      .total-divider span { padding: 0 .5rem; font-size: .875rem; font-weight: 600; color: ${TW.purple700}; }

      .totals-box p { display: flex; justify-content: space-between; margin: .25rem 0; font-size: .875rem; }
      .grand {
        border-top: 1px solid ${TW.purple200};
        margin-top: .5rem; padding-top: .5rem;
        font-weight: 700; font-size: 1.125rem; color: ${TW.purple900};
        text-align: right;
      }

      /* --- bank + signature grid (MUST match React) --- */
      .bank-signature-grid {
        display: grid; grid-template-columns: 1fr; gap: 1rem;
        border-top: 1px solid ${TW.gray200};
        padding-top: 1.5rem; margin-top: 1.5rem;
        font-size: .7rem;
        line-height:0.8;
      }
      @media (min-width: 768px) { .bank-signature-grid { grid-template-columns: 1fr 1fr; } }

      .bank-card {
        background: ${TW.purple50};
        border: 1px solid ${TW.purple200};
        border-radius: var(--radius-xl);
        padding: 1.25rem;
        box-shadow: 0 1px 3px rgba(0,0,0,.05);
      }
      .bank-card h3 {
        margin: 0 0 .75rem 0; text-transform: uppercase; font-weight: 600; color: ${TW.purple700};
      }
     .bank-grid {
  display: grid;
  grid-template-columns: 1fr; /* one per row for mobile */
  gap: .5rem 1rem;
}

@media (min-width: 480px) {
  .bank-grid {
    grid-template-columns: 1fr 1fr; /* two per row for larger screens */
  }
}



.bank-label {
font-weight: 600;
  font-size: .75rem;
  color: ${TW.black};
  margin-bottom: .25rem;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.bank-value {
  font-weight: 400;
  font-size: .875rem;
  color:${TW.black};
}

      .sign-wrap { text-align: right; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; }
      .sign-wrap .label { font-size: .875rem; color: ${TW.gray600}; margin-bottom: .25rem; }
      .sign-wrap img { height: 96px; width: 192px; object-fit: contain; border: 1px solid ${TW.gray300}; border-radius: .5rem; display: inline-block; }

      /* --- terms / notes --- */
      .section {
        width: 100%; border-top: 1px solid ${TW.gray200};
        margin-top: 1.5rem; padding-top: 1.5rem;
      }
      .section h3 { margin: 0 0 .5rem 0; font-weight: 600; color: ${TW.slate800}; font-size: 1.125rem; }
      .section p { color: ${TW.gray700}; white-space: pre-wrap; line-height: 1.6; margin: 0; }
    </style>
  </head>
  <body>
   
    
        

        <div class="card-content">
          <div class="hdr">
            <div>
              <h1>Invoice</h1>
              <div class="meta">
                <p><span class="label">Invoice No:</span> <span class="value"><strong>#${data.invoiceNumber || ""}</strong></span></p>
                <p><span class="label">Invoice Date:</span> <span class="value"><strong>${data.date || ""}</strong></span></p>
                <p><span class="label">Due Date:</span> <span class="value"><strong>${data.dueDate || ""}</strong></span></p>
              </div>
            </div>

             ${data.businessLogo ? `
              <div class="logo-wrap">
                <img src="${data.businessLogo}" alt="Business Logo" />
              </div>
            ` : ``}
          </div>

          <div class="billing-grid">
            <div class="bill-card">
              <h3>Billed By</h3>
              <p class="title">${data.billFromData?.businessName || ""}</p>
              <p>${data.billFromData?.address || ""}, ${data.billFromData?.city || ""}, ${data.billFromData?.state || ""}, India - ${data.billFromData?.pincode || ""}</p>
              ${data.billFromData?.gstin ? `<p>GSTIN: ${data.billFromData.gstin}</p>` : ``}
              ${data.billFromData?.pan ? `<p>PAN: ${data.billFromData.pan}</p>` : ``}
            </div>
            <div class="bill-card">
              <h3>Billed To</h3>
              <p class="title">${data.billToData?.businessName || ""}</p>
              <p>${data.billToData?.address || ""}, ${data.billToData?.city || ""}, ${data.billToData?.state || ""}, India - ${data.billToData?.pincode || ""}</p>
              ${data.billToData?.gstin ? `<p>GSTIN: ${data.billToData.gstin}</p>` : ``}
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th class="px-4 py-3 text-left">Item</th>
                  <th class="px-4 py-3 text-right">GST %</th>
                  <th class="px-4 py-3 text-right">Qty</th>
                  <th class="px-4 py-3 text-right">Rate</th>
                  <th class="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>${itemsHTML}</tbody>
            </table>
          </div>

          <div class="totals-row ${hasQR ? 'with-qr' : ''}">
  ${hasQR ? `
    <div class="qr-box">
      <p><strong>Scan to Pay</strong></p>
      <img src="${qrImage}" alt="QR Code" />
    </div>
  ` : ``}

        

            <div class="totals-box">
              <div class="total-divider">
                <hr/><span>TOTAL</span><hr/>
              </div>
              <p><span class="label" style="color:${TW.gray500}">Amount:</span> <strong>₹${total.toFixed(2)}</strong></p>
              ${Number(data.igst)  ? `<p><span style="color:${TW.gray500}">IGST:</span> <strong>₹${Number(data.igst).toFixed(2)}</strong></p>` : ``}
              ${Number(data.sgst)  ? `<p><span style="color:${TW.gray500}">SGST:</span> <strong>₹${Number(data.sgst).toFixed(2)}</strong></p>` : ``}
              ${Number(data.cgst)  ? `<p><span style="color:${TW.gray500}">CGST:</span> <strong>₹${Number(data.cgst).toFixed(2)}</strong></p>` : ``}
              ${Number(data.discount) ? `<p><span style="color:${TW.gray500}">Discount:</span> <span style="color:#dc2626; font-weight:600;">-₹${Number(data.discount).toFixed(2)}</span></p>` : ``}
              ${Number(data.additionalCharges) ? `<p><span style="color:${TW.gray500}">Additional Charges:</span> <strong>₹${Number(data.additionalCharges).toFixed(2)}</strong></p>` : ``}
              <p class="grand">Grand Total: ₹${grandTotal.toFixed(2)}</p>
            </div>
          </div>

          <div class="bank-signature-grid">
             <div class="bank-card">
<h3>Bank Details</h3>
<div class="bank-grid">
  ${bank.accountHolderName ? `
    <div class="bank-item">
      <span class="bank-label">Account Name</span>
      <span class="bank-value">${bank.accountHolderName}</span>
    </div>` : ``}

  ${bank.accountNumber ? `
    <div class="bank-item">
      <span class="bank-label">Account Number</span>
      <span class="bank-value">${bank.accountNumber}</span>
    </div>` : ``}

  ${bank.ifsc ? `
    <div class="bank-item">
      <span class="bank-label">IFSC</span>
      <span class="bank-value">${bank.ifsc}</span>
    </div>` : ``}

  ${bank.bankName ? `
    <div class="bank-item">
      <span class="bank-label">Bank</span>
      <span class="bank-value">${bank.bankName}</span>
    </div>` : ``}

  ${bank.accountType ? `
    <div class="bank-item">
      <span class="bank-label">Account Type</span>
      <span class="bank-value">${bank.accountType}</span>
    </div>` : ``}
</div>

</div>

            ${signature ? `
              <div class="sign-wrap">
                <p class="label">Authorized Signatory</p>
                <img src="${signature}" alt="Signature" />
              </div>
            ` : `<div></div>`}
          </div>

          ${data.terms ? `
            <div class="section">
              <h3>Terms and Conditions</h3>
              <p>${data.terms}</p>
            </div>
          ` : ``}

          ${notes ? `
            <div class="section">
              <h3>Notes</h3>
              <p>${notes}</p>
            </div>
          ` : ``}
        </div>
      
    
  </body>
  </html>
  `;
}

module.exports = generateInvoiceHTML;