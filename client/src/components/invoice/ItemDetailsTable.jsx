import { Card, CardContent } from "../card";
import { Button } from "../button";
import { Input } from "../Input";
import { X } from "lucide-react";

function formatNumber(value, format = "indian") {
  if (isNaN(value)) return value;
  const locale = format === "indian" ? "en-IN" : "en-US";
  return value.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const ItemDetailsTable = ({
  invoiceData,
  setInvoiceData,
  gstConfig,
  numberFormat = "indian",
  conversionRate = 1,
  currencySymbol = "₹",
}) => {
  const addNewItem = () => {
    const newItem = {
      item: "",
      gstRate: 18,
      quantity: 1,
      rate: 0,
      amount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
    };
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (index) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index, field, value) => {
    setInvoiceData((prev) => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[index], [field]: value };

      // Ensure numeric types before calculations
      item.quantity = parseFloat(item.quantity) || 0;
      item.rate = parseFloat(item.rate) || 0;
      item.gstRate = parseFloat(item.gstRate) || 0;

      item.amount = item.quantity * item.rate;

      if (gstConfig?.taxType === "GST" && gstConfig?.gstType === "IGST") {
        item.cgst = 0;
        item.sgst = 0;
        item.igst = (item.amount * item.gstRate) / 100;
        item.total = item.amount + item.igst;
      } else if (gstConfig?.taxType === "GST") {
        item.cgst = (item.amount * item.gstRate) / 200;
        item.sgst = (item.amount * item.gstRate) / 200;
        item.igst = 0;
        item.total = item.amount + item.cgst + item.sgst;
      } else {
        item.cgst = 0;
        item.sgst = 0;
        item.igst = 0;
        item.total = item.amount;
      }

      updatedItems[index] = item;

      const subtotal = updatedItems.reduce((sum, i) => sum + i.amount, 0);
      const cgst = updatedItems.reduce((sum, i) => sum + (i.cgst || 0), 0);
      const sgst = updatedItems.reduce((sum, i) => sum + (i.sgst || 0), 0);
      const igst = updatedItems.reduce((sum, i) => sum + (i.igst || 0), 0);
      const grandTotal =
        subtotal +
        cgst +
        sgst +
        igst -
        (prev.discount || 0) +
        (prev.additionalCharges || 0);

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        cgst,
        sgst,
        igst,
        grandTotal,
        summary: {
          subtotal,
          cgst,
          sgst,
          discount: prev.discount || 0,
          totalAmount: grandTotal,
        },
      };
    });
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Table Header */}
          <div className="flex w-full bg-gray-100 border-b font-medium">
            <div className="flex-1 px-4 py-2 border-r">Item</div>
            <div className="flex-1 px-4 py-2 border-r">Quantity</div>
            <div className="flex-1 px-4 py-2 border-r">Rate</div>
            <div className="flex-1 px-4 py-2 border-r">GST %</div>
            <div className="flex-1 px-4 py-2">Amount</div>
            <div className="w-8" />
          </div>

          {/* Table Rows */}
          <div className="max-h-72 overflow-y-auto">
            {Array.isArray(invoiceData.items) && invoiceData.items.map((item, index) => (
              <div key={index} className="flex w-full border-b items-center">
                <div className="flex-1 px-4 py-2 border-r">
                  <Input
                    value={item.item}
                    onChange={(e) => updateItem(index, "item", e.target.value)}
                    className="h-8"
                    placeholder="Item name"
                  />
                </div>
                <div className="flex-1 px-4 py-2 border-r">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", parseFloat(e.target.value) || 0)
                    }
                    className="h-8 text-center"
                  />
                </div>
                <div className="flex-1 px-4 py-2 border-r">
                  <div className="flex items-center">
                    <span className="px-2 h-10 flex items-center bg-gray-100 border border-r-0 rounded-l text-sm text-gray-500">
                      {currencySymbol}
                    </span>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(index, "rate", parseFloat(e.target.value) || 0)
                      }
                      className="h-8 rounded-l-none px-2"
                    />
                  </div>
                </div>
                <div className="flex-1 px-4 py-2 border-r">
                  <Input
                    type="number"
                    value={item.gstRate}
                    onChange={(e) =>
                      updateItem(index, "gstRate", parseFloat(e.target.value) || 0)
                    }
                    className="h-8 text-center"
                  />
                </div>
                <div className="flex-1 px-4 py-2 text-sm font-medium text-gray-700">
                  {currencySymbol}
                  {formatNumber(item.amount, numberFormat)}
                </div>
                <div className="w-8 flex items-center justify-center">
                  {invoiceData.items.length > 1 && (
                    <Button
                      onClick={() => removeItem(index)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Line Button */}
          <div className="px-4 py-4 bg-white border-t text-center">
            <Button
              onClick={addNewItem}
              variant="outline"
              className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Add New Line +
            </Button>
          </div>

          {/* Footer Options */}
          <div className="px-6 py-4 bg-gray-50 border-t flex flex-col md:flex-row justify-between text-sm">
            <span className="text-blue-600 cursor-pointer hover:underline">
              📈 Add Discount / Additional Charges
            </span>
            <span className="text-blue-600 cursor-pointer hover:underline">
              📊 Summarize Total Quantity
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
