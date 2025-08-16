function generateGSTR3BHTML({ from, to, data }) {
  return `
  <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
        h1 { text-align: center; color: #0f172a; margin-bottom: 8px; }
        .subheading { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #e2e8f0; padding: 10px; font-size: 14px; }
        th { background-color: #eff6ff; text-align: left; color: #1e40af; }
        .summary { margin-top: 32px; background: #f0f9ff; padding: 16px; border-radius: 8px; }
        .summary h2 { font-size: 16px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <h1>GSTR-3B Summary</h1>
      <div class="subheading">From: ${from} &nbsp;&nbsp; To: ${to}</div>

      <table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Description</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>3.1(a)</td>
            <td>Outward taxable supplies (other than zero-rated, nil-rated and exempted)</td>
            <td>${data.section_3_1.a}</td>
          </tr>
          <tr>
            <td>3.1(e)</td>
            <td>Exempted outward supplies</td>
            <td>${data.section_3_1.e}</td>
          </tr>
          <tr>
            <td>4</td>
            <td>Eligible ITC</td>
            <td>${data.section_4.eligibleITC}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Taxable:</strong> ₹${data.section_3_1.a}</p>
        <p><strong>Total Exempt:</strong> ₹${data.section_3_1.e}</p>
        <p><strong>Input Tax Credit Claimed:</strong> ₹${data.section_4.eligibleITC}</p>
      </div>
    </body>
  </html>
  `;
}

module.exports = generateGSTR3BHTML;
