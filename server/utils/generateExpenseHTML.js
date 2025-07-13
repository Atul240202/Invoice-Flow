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
      <td>${e.date || "-"}</td>
      <td>${e.vendor || "-"}</td>
      <td>${e.category || "-"}${e.subCategory ? " → " + e.subCategory : ""}</td>
      <td>${e.description || ""}</td>
      <td style="text-align:right;">₹${parseFloat(e.amount).toFixed(2)}</td>
      <td style="text-align:right;">${e.gstPercent || 0}%</td>
      <td style="text-align:center;">${e.itcEligible ? "✅" : "❌"}</td>
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
          color: #1e293b;
        }
        h1 {
          text-align: center;
          font-size: 28px;
          color: #0f172a;
          margin-bottom: 10px;
        }
        .subheading {
          text-align: center;
          font-size: 16px;
          color: #475569;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          padding: 10px;
          border: 1px solid #e5e7eb;
          font-size: 13px;
        }
        th {
          background: #f1f5f9;
          color: #0f172a;
          text-align: left;
        }
        tbody tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .summary {
          margin-top: 30px;
          padding: 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          width: 100%;
        }
        .summary h3 {
          font-size: 16px;
          margin-bottom: 10px;
          color: #1e293b;
        }
        .summary p {
          margin: 6px 0;
          font-size: 14px;
          color: #334155;
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
