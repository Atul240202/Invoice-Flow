import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Button } from "../button";
import { Input } from "../Input";
import { Label } from "../Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select";
import { Badge } from "../Badge";
import { ArrowLeft, Download, Mail, Printer, Upload, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../hooks/toast";
import { Switch } from "../Switch";

export const BankingPreviewStep = ({ 
  invoiceData, 
  billFromData, 
  billToData, 
  gstConfig,
  shippingDetails,
  onBack 
}) => {
  const { toast } = useToast();
  const [bankingEnabled, setBankingEnabled] = useState(true);
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [bankingDetails, setBankingDetails] = useState({
    upiId: "",
    qrCode: null,
    country: "India",
    bankName: "Bank Of Maharashtra",
    accountNumber: "6802555438",
    accountHolderName: "Animesh Pravinchandra Kudake",
    ifsc: "MAHB0000009",
    accountType: "Saving",
    currency: "INR"
  });

  const handleQRUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setBankingDetails(prev => ({ ...prev, qrCode: file }));
    }
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Invoice",
      description: "Invoice sent to printer",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download PDF",
      description: "Invoice PDF downloaded successfully",
    });
  };

  const handleSendEmail = () => {
    toast({
      title: "Email Sent",
      description: "Invoice sent via email successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Step 1
            </Button>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Banking & Preview</h1>
              <p className="text-gray-600">
                Add payment details and preview your invoice
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-2 border-blue-200 text-blue-700 bg-blue-50">
              Step 2 of 2
            </Badge>
          </div>
        </div>

        {/* Invoice Preview - Full Width */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="pb-6 border-b border-gray-200">
            <CardTitle className="text-2xl font-semibold text-gray-900">Invoice Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">INVOICE</h2>
                  <p className="text-lg text-slate-600 mt-1">#{invoiceData.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">Date: {invoiceData.date}</p>
                  {invoiceData.dueDate && (
                    <p className="text-slate-600">Due: {invoiceData.dueDate}</p>
                  )}
                </div>
              </div>

              {/* Bill From/To */}
              <div className="grid gap-8 md:grid-cols-2">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">Bill From:</h3>
                  <div className="text-slate-700 space-y-2">
                    <p className="font-semibold text-lg">{billFromData.businessName}</p>
                    {billFromData.address && <p>{billFromData.address}</p>}
                    {billFromData.city && <p>{billFromData.city}, {billFromData.state} {billFromData.pincode}</p>}
                    {billFromData.gstin && <p><span className="font-medium">GSTIN:</span> {billFromData.gstin}</p>}
                    {billFromData.phone && <p><span className="font-medium">Phone:</span> {billFromData.phone}</p>}
                    {billFromData.email && <p><span className="font-medium">Email:</span> {billFromData.email}</p>}
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">Bill To:</h3>
                  <div className="text-slate-700 space-y-2">
                    <p className="font-semibold text-lg">{billToData.businessName}</p>
                    {billToData.address && <p>{billToData.address}</p>}
                    {billToData.city && <p>{billToData.city}, {billToData.state} {billToData.pincode}</p>}
                    {billToData.gstin && <p><span className="font-medium">GSTIN:</span> {billToData.gstin}</p>}
                    {billToData.phone && <p><span className="font-medium">Phone:</span> {billToData.phone}</p>}
                    {billToData.email && <p><span className="font-medium">Email:</span> {billToData.email}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Details */}
              {shippingDetails && (shippingDetails.shippedFrom.businessName || shippingDetails.shippedTo.businessName) && (
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-bold text-slate-900 mb-4 text-lg">Shipped From:</h3>
                    <div className="text-slate-700 space-y-2">
                      <p className="font-semibold">{shippingDetails.shippedFrom.businessName}</p>
                      <p>{shippingDetails.shippedFrom.country}</p>
                      {shippingDetails.shippedFrom.address && <p>{shippingDetails.shippedFrom.address}</p>}
                      {shippingDetails.shippedFrom.city && <p>{shippingDetails.shippedFrom.city}, {shippingDetails.shippedFrom.state}</p>}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-bold text-slate-900 mb-4 text-lg">Shipped To:</h3>
                    <div className="text-slate-700 space-y-2">
                      <p className="font-semibold">{shippingDetails.shippedTo.businessName}</p>
                      <p>{shippingDetails.shippedTo.country}</p>
                      {shippingDetails.shippedTo.address && <p>{shippingDetails.shippedTo.address}</p>}
                      {shippingDetails.shippedTo.city && <p>{shippingDetails.shippedTo.city}, {shippingDetails.shippedTo.state}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table */}
              {invoiceData.items.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">Items:</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="p-3 text-left">Item & Description</th>
                          <th className="p-3 text-center">HSN/SAC</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Rate</th>
                          <th className="p-3 text-right">Amount</th>
                          <th className="p-3 text-center">GST%</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.items.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <p className="font-semibold">{item.item}</p>
                            </td>
                            <td className="p-3 text-center text-sm">{item.hsn}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">₹{item.rate.toFixed(2)}</td>
                            <td className="p-3 text-right">₹{item.amount.toFixed(2)}</td>
                            <td className="p-3 text-center">{item.gstRate}%</td>
                            <td className="p-3 text-right font-semibold">₹{item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-80 bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{invoiceData.subtotal.toFixed(2)}</span>
                    </div>
                    {invoiceData.cgst > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">CGST:</span>
                        <span className="font-medium">₹{invoiceData.cgst.toFixed(2)}</span>
                      </div>
                    )}
                    {invoiceData.sgst > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{gstConfig.gstType === "CGST+SGST" ? "SGST" : "IGST"}:</span>
                        <span className="font-medium">₹{invoiceData.sgst.toFixed(2)}</span>
                      </div>
                    )}
                    {invoiceData.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span>-₹{invoiceData.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {invoiceData.additionalCharges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Additional Charges:</span>
                        <span className="font-medium">₹{invoiceData.additionalCharges.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-xl border-t pt-3 mt-3">
                      <span>Grand Total:</span>
                      <span className="text-blue-600">₹{invoiceData.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Details Section */}
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
              {/* Show Bank Account Details Toggle */}
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

              {/* Bank Account Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Bank Account</h3>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    ✏️ Edit
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                  <h4 className="font-semibold text-lg">{bankingDetails.bankName}</h4>
                  <p className="text-gray-700 font-medium">{bankingDetails.accountHolderName}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Account No:</span> {bankingDetails.accountNumber}
                    </div>
                    <div>
                      <span className="font-medium">IFSC:</span> {bankingDetails.ifsc}
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-gray-300 h-12">
                  Select Another Bank Account
                </Button>
              </div>

              {/* Add UPI Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded">
                      <span className="text-xl">📱</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Add UPI Details</h3>
                      <p className="text-sm text-gray-600">Collect payments via UPI apps such as Google Pay, PhonePe, and PayTM.</p>
                    </div>
                  </div>
                </div>
                
                <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12">
                  ➕ Add UPI ID
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Final Actions */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Final Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={handlePrint} className="h-14 bg-gray-600 hover:bg-gray-700 text-white font-medium">
                <Printer className="mr-2 h-5 w-5" />
                Print Invoice
              </Button>
              <Button onClick={handleDownload} className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                <Download className="mr-2 h-5 w-5" />
                Download as PDF
              </Button>
              <Button onClick={handleSendEmail} className="h-14 bg-green-600 hover:bg-green-700 text-white font-medium">
                <Mail className="mr-2 h-5 w-5" />
                Send via Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};