import { useState, useRef } from "react";
import { Card, CardContent } from "../card";
import { Input } from "../Input";
import { Label } from "../Label";
import { Checkbox } from "../checkbox";

// Helper function to convert numbers to words (simple Indian format)
function numberToWords(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
    'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
    'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  }

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = inWords(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + inWords(paise) + ' Paise';
  return result + ' Only';
}

// Currency utilities (pass from props or import if external)
const currencySymbols = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export const TotalsSection = ({ invoiceData, setInvoiceData, gstConfig, conversionRate = 1, currencySymbol = "₹" }) => {
  const [showInWords, setShowInWords] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const fileInputRef = useRef(null);

  const subtotal = (Number(invoiceData.subtotal) || 0) * conversionRate;
  const discountPercentage = Number(invoiceData.discountPercentage) || 0;
  const additionalCharges = (Number(invoiceData.additionalCharges) || 0) * conversionRate;

  const discountAmount = (subtotal * discountPercentage) / 100;
  const taxableAmount = subtotal - discountAmount + additionalCharges;

  let gstAmount = 0;
  let gstLabel = "";
  if (gstConfig?.taxType === "GST" && gstConfig.gstType) {
    const gstRate = 0.18;
    gstAmount = taxableAmount * gstRate;
    gstLabel = gstConfig.gstType === "IGST" ? "IGST (18%)" : "CGST+SGST (18%)";
  }

  const grandTotal = taxableAmount + gstAmount;

  

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setQrImage(reader.result);
      setInvoiceData(prev => ({
        ...prev,
        qrImage: file 
      }));
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };
  

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-lg">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* QR Upload */}
          <div className="w-full md:w-1/3 flex flex-col items-center justify-start">
            <Label className="text-sm text-gray-700 mb-2">Upload QR Code</Label>
            <div
              className="w-56 h-56 bg-blue-100 border-2 border-blue-500 rounded-lg flex items-center justify-center text-blue-700 cursor-pointer hover:bg-blue-200 transition"
              onClick={handleUploadClick}
            >
              {qrImage ? (
                <img
                  src={qrImage}
                  alt="QR Preview"
                  className="w-full h-full object-contain rounded"
                />
              ) : (
                <span className="text-sm text-center px-2">Click to Upload QR</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="w-full md:w-2/3 space-y-4">
            <div className="text-right space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount ({discountPercentage}%)</span>
                <span className="font-semibold text-red-600">- {currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Additional Charges</span>
                <span className="font-semibold text-green-700">+ {currencySymbol}{additionalCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-gray-700 font-medium">Taxable Amount</span>
                <span className="font-semibold">{currencySymbol}{taxableAmount.toFixed(2)}</span>
              </div>
              {gstConfig?.taxType === "GST" && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{gstLabel}</span>
                  <span className="font-semibold text-blue-700">+ {currencySymbol}{gstAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-gray-900 text-lg font-bold">Grand Total</span>
                <span className="text-2xl font-bold text-blue-900">{currencySymbol}{grandTotal.toFixed(2)}</span>
              </div>

              {showInWords && (
                <div className="text-sm mt-2 text-gray-700 italic border-t pt-2 text-left">
                  In Words: <span className="font-medium">{numberToWords(grandTotal)}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={invoiceData.discountPercentage}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      discountPercentage: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="h-10 border-gray-300 focus:border-blue-500"
                  placeholder="e.g. 10%"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Additional Charges</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceData.additionalCharges}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({
                      ...prev,
                      additionalCharges: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="h-10 border-gray-300 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-total-words"
                  checked={showInWords}
                  onCheckedChange={(checked) => setShowInWords(!!checked)}
                />
                <Label htmlFor="show-total-words" className="text-sm text-blue-600">
                  Show Total In Words
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="add-more-fields" />
                <Label htmlFor="add-more-fields" className="text-sm text-blue-600">
                  Add More Fields
                </Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
