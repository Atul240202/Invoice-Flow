import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Separator } from "../separator";
import { useFormContext } from "react-hook-form";
import { format } from "date-fns";

const BankingPreviewStep = () => {
  const form = useFormContext();

  if (!form) {
    console.error("❌ useFormContext() returned null in BankingPreviewStep");
    return <div>Error: Form context not found.</div>;
  }

  const invoiceData = form.getValues();

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4">
      <Card className="shadow-lg border border-gray-200 rounded-2xl">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-3xl font-bold text-slate-900">Invoice Preview</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          {/* === Top Section === */}
          {/* === Top Section === */}
<div className="flex flex-col md:flex-row justify-between gap-6">
  {/* Left Side: Dates & Invoice Info */}
  <div className="text-sm space-y-2">
    <div>
      <p className="text-gray-500">Invoice Number</p>
      <p className="font-medium">{invoiceData.invoiceNumber}</p>
    </div>
    <div>
      <p className="text-gray-500">Issue Date</p>
      <p className="font-medium">{safeFormatDate(invoiceData.date)}</p>
    </div>
    <div>
      <p className="text-gray-500">Due Date</p>
      <p className="font-medium">{safeFormatDate(invoiceData.dueDate)}</p>
    </div>
  </div>

  {/* Right Side: Logo & Business Info */}
  <div className="text-right space-y-2">
    {invoiceData.businessLogo && (
      <img
        src={URL.createObjectURL(invoiceData.businessLogo)}
        alt="Business Logo"
        className="h-16 w-auto ml-auto"
      />
    )}
    <h2 className="text-xl font-semibold text-slate-800">
      {invoiceData.billFromData?.businessName}
    </h2>
    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
      {invoiceData.billFromData?.address}, {invoiceData.billFromData?.city},{" "}
      {invoiceData.billFromData?.state} - {invoiceData.billFromData?.pincode}
    </p>
    {invoiceData.billFromData?.gstin && (
      <p className="text-sm">GSTIN: {invoiceData.billFromData.gstin}</p>
    )}
    {invoiceData.billFromData?.email && (
      <p className="text-sm">Email: {invoiceData.billFromData.email}</p>
    )}
  </div>
</div>


          {/* === Billing Info === */}
          <div className="grid md:grid-cols-2 gap-6 border rounded-xl p-4 bg-gray-50">
            <div>
              <h3 className="font-semibold mb-1 text-slate-700">Bill From</h3>
              <p className="text-sm">{invoiceData.billFromData?.businessName}</p>
              <p className="text-sm whitespace-pre-wrap text-gray-700">
                {invoiceData.billFromData?.address}, {invoiceData.billFromData?.city},{" "}
                {invoiceData.billFromData?.state} - {invoiceData.billFromData?.pincode}
              </p>
              {invoiceData.billFromData?.gstin && (
                <p className="text-sm">GSTIN: {invoiceData.billFromData.gstin}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-slate-700">Bill To</h3>
              <p className="text-sm">{invoiceData.billToData?.businessName}</p>
              <p className="text-sm whitespace-pre-wrap text-gray-700">
                {invoiceData.billToData?.address}, {invoiceData.billToData?.city},{" "}
                {invoiceData.billToData?.state} - {invoiceData.billToData?.pincode}
              </p>
              {invoiceData.billToData?.gstin && (
                <p className="text-sm">GSTIN: {invoiceData.billToData.gstin}</p>
              )}
            </div>
          </div>

          {/* === Invoice Items === */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Invoice Items</h3>
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2">Item</th>
                  <th className="text-right px-4 py-2">Qty</th>
                  <th className="text-right px-4 py-2">Rate</th>
                  <th className="text-right px-4 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items?.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{item.item}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.rate)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.quantity * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* === Totals Section === */}
        {/* === Totals + QR in Flexbox === */}
<div className="flex justify-between items-start gap-4 pt-4">
  {/* Totals */}
  <div className="text-right space-y-1 w-full">
    <p className="text-sm">
      Subtotal: <span className="font-medium">{formatCurrency(totalItemsAmount)}</span>
    </p>
    {invoiceData.cgst > 0 && (
      <p className="text-sm">
        CGST: <span className="font-medium">{formatCurrency(invoiceData.cgst)}</span>
      </p>
    )}
    {invoiceData.sgst > 0 && (
      <p className="text-sm">
        SGST: <span className="font-medium">{formatCurrency(invoiceData.sgst)}</span>
      </p>
    )}
    {invoiceData.igst > 0 && (
      <p className="text-sm">
        IGST: <span className="font-medium">{formatCurrency(invoiceData.igst)}</span>
      </p>
    )}
    {invoiceData.discount > 0 && (
      <p className="text-sm">
        Discount: <span className="font-medium">-{formatCurrency(invoiceData.discount)}</span>
      </p>
    )}
    {invoiceData.additionalCharges > 0 && (
      <p className="text-sm">
        Additional Charges: <span className="font-medium">{formatCurrency(invoiceData.additionalCharges)}</span>
      </p>
    )}
    <Separator />
    <p className="text-lg font-semibold text-slate-900">
      Grand Total: {formatCurrency(grandTotal)}
    </p>
  </div>

  {/* QR Code */}
  {invoiceData.qrImage && (
    <div className="text-center">
      <p className="text-sm mb-2">Scan to Pay</p>
      <img
        src={URL.createObjectURL(invoiceData.qrImage)}
        alt="QR Code"
        className="h-28 w-28 object-contain border rounded shadow"
      />
    </div>
  )}
</div>


          {/* === Notes & Terms === */}
          {(invoiceData.terms || invoiceData.notes) && (
            <div className="border-t pt-4 space-y-4">
              {invoiceData.terms && (
                <div>
                  <h3 className="font-bold">Terms & Conditions</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoiceData.terms}</p>
                </div>
              )}
              {invoiceData.notes && (
                <div>
                  <h3 className="font-bold">Additional Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoiceData.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* === Signature === */}
          {invoiceData.signature && (
            <div className="pt-6 text-right">
              <p className="text-sm">Authorized Signature:</p>
              <img
                src={URL.createObjectURL(invoiceData.signature)}
                alt="Signature"
                className="h-16 inline-block mt-2"
              />
            </div>
          )}

          {/* === Attachments === */}
          {invoiceData.attachments?.length > 0 && (
            <div className="pt-6">
              <h3 className="font-bold mb-2">Attachments</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {invoiceData.attachments.map((file, idx) => (
                  <li key={idx}>
                    <a
                      href={URL.createObjectURL(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {file.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankingPreviewStep;
