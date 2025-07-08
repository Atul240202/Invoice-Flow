import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Separator } from "../separator";
import { useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { Switch } from "../Switch";
import { ChevronUp,ChevronDown,Printer,Download,Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import axios from 'axios';




const BankingPreviewStep = ({ invoiceData,billFromData,billToData }) => {
  const form = useFormContext();
  const [showBankDetails, setShowBankDetails] = useState(true);

  const [bankingDetails] = useState({
    bankName: "HDFC Bank",
    accountHolderName: "John Doe",
    accountNumber: "1234567890",
    ifsc: "HDFC0001234",
  });

  if (!form) {
    console.error("❌ useFormContext() returned null in BankingPreviewStep");
    return <div>Error: Form context not found.</div>;
  }

  

  const formatCurrency = (amount) => {
    const symbol = invoiceData.currency === "INR" ? "₹" : "$";
    return `${symbol}${amount.toFixed(2)}`;
  };

  const calculateItemTotal = (item) => item.quantity * item.rate;

  const safeFormatDate = (value) => {
    const date = new Date(value);
    return value && !isNaN(date.getTime()) ? format(date, "PPP") : "-";
  };

  const totalItemsAmount = invoiceData.items?.reduce(
    (acc, item) => acc + calculateItemTotal(item),
    0
  ) || 0;

  const totalTaxes =
    (invoiceData.cgst || 0) + (invoiceData.sgst || 0) + (invoiceData.igst || 0);

  const grandTotal =
    totalItemsAmount +
    totalTaxes +
    (invoiceData.additionalCharges || 0) -
    (invoiceData.discount || 0);

    const handlePrint = () => {
    window.print();
  };

  
  
const downloadPDF = async () => {
  try {
      
    
    
     const payload = {
      ...invoiceData,
      billFromData,
      billToData,
    };

    const response = await axios.post('http://localhost:5000/generate-pdf', payload, {
      responseType: 'blob', // important!
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `invoice-${invoiceData.invoiceNumber || 'download'}.pdf`;
    link.click();
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};

  const handleSendEmail = () => {
    // Add email sending logic
    alert("Send email logic goes here");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4">
      <Card className="shadow-lg border border-gray-200 rounded-2xl">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-3xl font-bold text-slate-900">Invoice Preview</CardTitle>
        </CardHeader>

      <CardContent className="space-y-10 pt-8 text-slate-800 font-sans">
 {/* === Header: Invoice Title + Info === */}
<div className="flex flex-col md:flex-row justify-between items-start border-b pb-6">
  <div>
    <h1 className="text-5xl  text-purple-700 uppercase tracking-tight mb-3">Invoice</h1>
    <div className="space-y-1 text-sm">
      <p>
        <span className="text-gray-500">Invoice No:</span>{" "}
        <span className="text-black font-medium">#{invoiceData.invoiceNumber}</span>
      </p>
      <p>
        <span className="text-gray-500">Invoice Date:</span>{" "}
        <span className="text-black font-medium">{safeFormatDate(invoiceData.date)}</span>
      </p>
      <p>
        <span className="text-gray-500">Due Date:</span>{" "}
        <span className="text-black font-medium">{safeFormatDate(invoiceData.dueDate)}</span>
      </p>
    </div>
  </div>

  {/* Logo */}
  {invoiceData.businessLogo && (
    <div className="mt-6 md:mt-0">
      <img
        src={URL.createObjectURL(invoiceData.businessLogo)}
        alt="Business Logo"
        className="h-20 w-auto rounded-md shadow-sm border"
      />
    </div>
  )}
</div>
{/* === Billing Info === */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
  {/* Billed By */}
  <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 shadow-sm">
    <h3 className="uppercase font-bold text-purple-700 mb-2">Billed By</h3>
    <p className="font-semibold text-slate-900">{billFromData?.businessName}</p>
<p>{billFromData?.address}, {billFromData?.city}, {billFromData?.state}, India - {billFromData?.pincode}</p>

    {invoiceData.billFromData?.gstin && (
      <p className="text-slate-700 mt-1">GSTIN: {billFromData.gstin}</p>
    )}
    {invoiceData.billFromData?.pan && (
      <p className="text-slate-700">PAN: {billFromData.pan}</p>
    )}
  </div>

  {/* Billed To */}
  <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 shadow-sm">
    <h3 className="uppercase font-bold text-purple-700 mb-2">Billed To</h3>
    <p className="font-semibold text-slate-900">{billToData?.businessName}</p>
    <p className="text-slate-700 whitespace-pre-wrap leading-snug">
      {billToData?.address}, {billToData?.city},{" "}
      {billToData?.state}, India - {billToData?.pincode}
    </p>
    {billToData?.gstin && (
      <p className="text-slate-700 mt-1">GSTIN: {billToData.gstin}</p>
    )}
  </div>
</div>


  {/* === Items Table === */}
<div className="rounded-xl border overflow-hidden shadow-sm">
  <table className="w-full text-sm border-collapse">
    <thead className="bg-purple-200 text-purple-900 uppercase text-xs tracking-wider">
      <tr>
        <th className="px-4 py-3 text-left">Item</th>
        <th className="px-4 py-3 text-right">GST %</th>
        <th className="px-4 py-3 text-right">Qty</th>
        <th className="px-4 py-3 text-right">Rate</th>
        <th className="px-4 py-3 text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      {invoiceData.items?.map((item, idx) => (
        <tr
          key={idx}
          className={idx % 2 === 0 ? "bg-purple-50 text-slate-800" : "bg-white text-slate-800"}
        >
          <td className="px-4 py-3">{item.item}</td>
          <td className="px-4 py-3 text-right">{item.gstRate || 0}%</td>
          <td className="px-4 py-3 text-right">{item.quantity}</td>
          <td className="px-4 py-3 text-right">{formatCurrency(item.rate)}</td>
          <td className="px-4 py-3 text-right">
            {formatCurrency(item.quantity * item.rate)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


  {/* === Totals Section === */}
<div className="flex justify-end mt-6">
  <div className="w-full md:w-1/2 lg:w-1/3 border rounded-xl bg-purple-50 p-5 space-y-3 shadow-sm">
    
    {/* Divider with "Total" label centered */}
    <div className="flex items-center justify-between mb-2">
      <hr className="flex-grow border-purple-300" />
      <span className="px-3 text-sm font-semibold text-purple-700">TOTAL</span>
      <hr className="flex-grow border-purple-300" />
    </div>

    {/* Line Items */}
    <div className="text-sm text-slate-800 space-y-1">
      <p className="flex justify-between">
        <span className="text-gray-500">Amount:</span>
        <strong>{formatCurrency(totalItemsAmount)}</strong>
      </p>
      {invoiceData.igst > 0 && (
        <p className="flex justify-between">
          <span className="text-gray-500">IGST:</span>
          <strong>{formatCurrency(invoiceData.igst)}</strong>
        </p>
      )}
      {invoiceData.sgst > 0 && (
        <p className="flex justify-between">
          <span className="text-gray-500">SGST:</span>
          <strong>{formatCurrency(invoiceData.sgst)}</strong>
        </p>
      )}
      {invoiceData.cgst > 0 && (
        <p className="flex justify-between">
          <span className="text-gray-500">CGST:</span>
          <strong>{formatCurrency(invoiceData.cgst)}</strong>
        </p>
      )}
      {invoiceData.discount > 0 && (
        <p className="flex justify-between">
          <span className="text-gray-500">Discount:</span>
          <span className="text-red-600 font-semibold">-{formatCurrency(invoiceData.discount)}</span>
        </p>
      )}
      {invoiceData.additionalCharges > 0 && (
        <p className="flex justify-between">
          <span className="text-gray-500">Additional Charges:</span>
          <strong>{formatCurrency(invoiceData.additionalCharges)}</strong>
        </p>
      )}
    </div>

    {/* Grand Total */}
    <div className="pt-2 border-t border-purple-200">
      <p className="text-right text-lg font-bold text-purple-900 mt-2">
        Grand Total: {formatCurrency(grandTotal)}
      </p>
    </div>
  </div>
</div>


  {/* === Totals + Bank + Signature === */}
<div className="grid md:grid-cols-2 gap-4 border-t pt-6 text-sm">
  {/* === Bank Details on LHS === */}
  <div>
    <h3 className="uppercase font-semibold text-slate-800 mb-2">Bank Details</h3>
    <div className="grid sm:grid-cols-2 gap-y-1 text-gray-700">
      <p><strong>Account Name:</strong> Animesh Pravinchandra Kudake</p>
      <p><strong>Account Number:</strong> 68025555438</p>
      <p><strong>IFSC:</strong> MAHB0000009</p>
      <p><strong>Bank:</strong> Bank Of Maharashtra</p>
      <p><strong>Account Type:</strong> Savings</p>
    </div>
  </div>

  {/* === Signature on RHS === */}
  {invoiceData.signature && (
    <div className="text-right flex flex-col justify-end items-end">
      <p className="text-sm text-gray-600">Authorized Signatory</p>
      <img
        src={URL.createObjectURL(invoiceData.signature)}
        alt="Signature"
        className="h-16 mt-2 inline-block"
      />
    </div>
  )}
</div>

{/* === Terms and Conditions Full Width === */}
{invoiceData.terms && (
  <div className="pt-6 text-sm space-y-2 border-t mt-6">
    <h3 className="font-semibold text-slate-800">Terms and Conditions</h3>
    <p className="text-gray-700 whitespace-pre-wrap">{invoiceData.terms}</p>
  </div>
)}
</CardContent>


      </Card>
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">🏛️</span>
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Bank And UPI Details</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-green-500 text-sm font-medium">✓ Enabled</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBankDetails(!showBankDetails)}
            >
              {showBankDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {showBankDetails && (
          <CardContent className="space-y-6">
            {/* Bank Account Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded">
                  <span className="text-xl">🏛️</span>
                </div>
                <div>
                  <h3 className="font-medium">Show Bank Account Details</h3>
                  <p className="text-sm text-gray-600">NEFT, IMPS, CASH</p>
                </div>
              </div>
              <Switch checked={showBankDetails} onCheckedChange={setShowBankDetails} />
            </div>

            {/* Bank Account Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Bank Account</h3>
                <Button variant="ghost" size="sm" className="text-blue-600">✏️ Edit</Button>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <h4 className="font-semibold text-lg">{bankingDetails.bankName}</h4>
                <p className="text-gray-700 font-medium">{bankingDetails.accountHolderName}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div><span className="font-medium">Account No:</span> {bankingDetails.accountNumber}</div>
                  <div><span className="font-medium">IFSC:</span> {bankingDetails.ifsc}</div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-gray-300 h-12">
                Select Another Bank Account
              </Button>
            </div>

            {/* UPI Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded">
                  <span className="text-xl">📱</span>
                </div>
                <div>
                  <h3 className="font-medium">Add UPI Details</h3>
                  <p className="text-sm text-gray-600">
                    Collect payments via UPI apps like Google Pay, PhonePe, PayTM.
                  </p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12">
                ➕ Add UPI ID
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* --- Final Actions --- */}
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Final Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handlePrint} className="h-14 bg-gray-600 hover:bg-gray-700 text-white font-medium">
              <Printer className="mr-2 h-5 w-5" /> Print Invoice
            </Button>
            <Button onClick={downloadPDF} className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium">
              <Download className="mr-2 h-5 w-5" /> Download as PDF
            </Button>
            <Button onClick={handleSendEmail} className="h-14 bg-green-600 hover:bg-green-700 text-white font-medium">
              <Mail className="mr-2 h-5 w-5" /> Send via Email
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default BankingPreviewStep;
