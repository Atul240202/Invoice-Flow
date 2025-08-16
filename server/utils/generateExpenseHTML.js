function generateExpenseReportHTML({ expenses = [] }) {
  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalGST = expenses.reduce(
    (sum, e) => sum + (parseFloat(e.gstPercent || 0) / 100) * parseFloat(e.amount || 0),
    0
  );
  const totalITC = expenses
    .filter((e) => e.itcEligible)
    .reduce(
      (sum, e) => sum + (parseFloat(e.gstPercent || 0) / 100) * parseFloat(e.amount || 0),
      0
    );

  const rows = expenses
    .map(
      (e) => `
      <tr>
        <td>${new Date(e.date).toLocaleDateString()}</td>
        <td>${e.vendor || "-"}</td>
        <td>${e.category || "-"}${e.subCategory ? " → " + e.subCategory : ""}</td>
        <td>${e.description || "-"}</td>
        <td style="text-align:right;">₹${parseFloat(e.amount).toFixed(2)}</td>
        <td style="text-align:right;">${e.gstPercent || 0}%</td>
        <td style="text-align:center;">${e.itcEligible ? "Yes" : "No"}</td>
      </tr>`
    )
    .join("");

  return `
  <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          padding: 40px;
          background: #f8fafc;
          color: #1e293b;
        }
        h1 {
          text-align: center;
          font-size: 32px;
          color: #0369a1;
          margin-bottom: 5px;
        }
        .subheading {
          text-align: center;
          font-size: 15px;
          color: #64748b;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border-radius: 8px;
          overflow: hidden;
        }
        th, td {
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
        }
        th {
          background: #e0f2fe;
          color: #0f172a;
          text-align: left;
        }
        tbody tr:nth-child(even) {
          background-color: #f1f5f9;
        }
        .summary {
          margin-top: 40px;
          margin-right:40px;
          padding: 24px;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          border-radius: 10px;
          width: 93%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
        .summary h3 {
          font-size: 18px;
          margin-bottom: 12px;
          color: #0369a1;
        }
        .summary p {
          margin: 6px 0;
          font-size: 15px;
          color: #334155;
        }
        .summary p strong {
          color: #0f172a;
        }
      </style>
    </head>
    <body>
      <h1>Expense Report</h1>
      <div class="subheading">Generated on ${new Date().toLocaleDateString()}</div>

      <table>
        <thead>
          <tr>
            <th style="width: 12%;">Date</th>
            <th style="width: 18%;">Vendor</th>
            <th style="width: 20%;">Category</th>
            <th style="width: 25%;">Description</th>
            <th style="width: 10%; text-align:right;">Amount</th>
            <th style="width: 7%; text-align:right;">GST%</th>
            <th style="width: 8%; text-align:center;">ITC</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Expenses:</strong> ₹${totalAmount.toFixed(2)}</p>
        <p><strong>Total GST:</strong> ₹${totalGST.toFixed(2)}</p>
        <p><strong>Input Tax Credit (ITC) Eligible:</strong> ₹${totalITC.toFixed(2)}</p>
        <p><strong>Net Outflow:</strong> ₹${(totalAmount - totalITC).toFixed(2)}</p>
      </div>
    </body>
  </html>
  `;
}

module.exports = generateExpenseReportHTML;
