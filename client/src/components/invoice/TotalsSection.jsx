import { Card, CardContent } from "../card";
import { Input } from "../Input";
import { Label } from "../Label";
import { Checkbox } from "../checkbox";

export const TotalsSection = ({ invoiceData, setInvoiceData, gstConfig }) => {
  // Calculate values
  const subtotal = Number(invoiceData.subtotal) || 0;
  const discount = Number(invoiceData.discount) || 0;
  const additionalCharges = Number(invoiceData.additionalCharges) || 0;
  const taxableAmount = subtotal - discount + additionalCharges;

  // GST calculation (example: 18%)
  let gstAmount = 0;
  let gstLabel = "";
  if (gstConfig && gstConfig.taxType === "GST" && gstConfig.gstType) {
    const gstRate = 0.18; // You can make this dynamic if needed
    gstAmount = taxableAmount * gstRate;
    gstLabel = gstConfig.gstType === "IGST" ? "IGST (18%)" : "CGST+SGST (18%)";
  }

  const grandTotal = taxableAmount + gstAmount;

  // Optionally update grandTotal in invoiceData
  // setInvoiceData((prev) => ({ ...prev, grandTotal }));

  return (
    <Card className="bg-white border border-gray-200 rounded-lg">
      <CardContent className="p-6">
        <div className="max-w-md ml-auto space-y-4">
          <div className="text-right space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount</span>
              <span className="font-semibold text-red-600">- ₹{discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Additional Charges</span>
              <span className="font-semibold text-green-700">+ ₹{additionalCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-gray-700 font-medium">Taxable Amount</span>
              <span className="font-semibold">₹{taxableAmount.toFixed(2)}</span>
            </div>
            {gstConfig && gstConfig.taxType === "GST" && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">{gstLabel}</span>
                <span className="font-semibold text-blue-700">+ ₹{gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-gray-900 text-lg font-bold">Grand Total</span>
              <span className="text-2xl font-bold text-blue-900">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Add Discount (Optional)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={invoiceData.discount}
                onChange={(e) =>
                  setInvoiceData((prev) => ({
                    ...prev,
                    discount: parseFloat(e.target.value) || 0,
                  }))
                }
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Add Additional Charges (Optional)</Label>
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

          <div className="flex items-center justify-end gap-2 pt-4">
            <Checkbox id="show-total-words" />
            <Label htmlFor="show-total-words" className="text-sm text-blue-600">
              Show Total In Words
            </Label>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Checkbox id="add-more-fields" />
            <Label htmlFor="add-more-fields" className="text-sm text-blue-600">
              Add More Fields
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};