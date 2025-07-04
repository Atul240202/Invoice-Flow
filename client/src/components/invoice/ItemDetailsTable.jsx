import { Card, CardContent } from "../card";
import { Button } from "../button";
import { Input } from "../Input";
import { X } from "lucide-react";

// Utility for number formatting
function formatNumber(value, format = "indian") {
  if (isNaN(value)) return value;
  if (format === "indian") {
    return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const ItemDetailsTable = ({
  invoiceData,
  setInvoiceData,
  gstConfig,
  itemColumns,
  numberFormat = "indian"
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
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      const item = updatedItems[index];
      item.amount = item.quantity * item.rate;

      // GST calculation (adjust as needed for IGST/CGST/SGST)
      if (gstConfig && gstConfig.taxType === "GST" && gstConfig.gstType === "IGST") {
        item.cgst = 0;
        item.sgst = 0;
        item.igst = (item.amount * item.gstRate) / 100;
        item.total = item.amount + item.igst;
      } else if (gstConfig && gstConfig.taxType === "GST") {
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

      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      const cgst = updatedItems.reduce((sum, item) => sum + (item.cgst || 0), 0);
      const sgst = updatedItems.reduce((sum, item) => sum + (item.sgst || 0), 0);
      const igst = updatedItems.reduce((sum, item) => sum + (item.igst || 0), 0);
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
      };
    });
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-lg">
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 p-3 text-sm font-medium">
          {itemColumns.filter(c => c.visible).map(col => (
            <div key={col.key} className="col-span-2">{col.label}</div>
          ))}
          <div className="col-span-1"></div>
        </div>

        {/* Table Rows */}
        {invoiceData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 p-3 items-center">
            {itemColumns.filter(c => c.visible).map(col => (
              <div key={col.key} className="col-span-2">
                {/* Render input based on col.key */}
                {col.key === "item" && (
                  <Input
                    value={item.item}
                    onChange={e => updateItem(index, "item", e.target.value)}
                    className="h-8 border-gray-300 focus:border-blue-500"
                    placeholder="Item Name"
                  />
                )}
                {col.key === "gstRate" && (
                  <Input
                    type="number"
                    value={item.gstRate}
                    onChange={e =>
                      updateItem(index, "gstRate", parseFloat(e.target.value) || 0)
                    }
                    className="h-8 border-gray-300 focus:border-blue-500 text-center"
                    placeholder="GST %"
                    min="0"
                    max="100"
                  />
                )}
                {col.key === "quantity" && (
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={e =>
                      updateItem(index, "quantity", parseInt(e.target.value) || 0)
                    }
                    className="h-8 border-gray-300 focus:border-blue-500 text-center"
                  />
                )}
                {col.key === "rate" && (
                  <div className="flex">
                    <span className="bg-gray-100 px-2 py-1 text-sm border border-r-0 rounded-l">₹</span>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={e =>
                        updateItem(index, "rate", parseFloat(e.target.value) || 0)
                      }
                      className="h-8 border-gray-300 focus:border-blue-500 rounded-l-none"
                    />
                  </div>
                )}
                {col.key === "amount" && (
                  <span className="text-sm">
                    ₹{formatNumber(item.amount, numberFormat)}
                  </span>
                )}
                {/* For custom fields, render a generic input */}
                {!(["item", "gstRate", "quantity", "rate", "amount"].includes(col.key)) && (
                  <Input
                    value={item[col.key] || ""}
                    onChange={e => updateItem(index, col.key, e.target.value)}
                    className="h-8 border-gray-300 focus:border-blue-500"
                  />
                )}
              </div>
            ))}
            <div className="col-span-1">
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

        {/* Add New Line Button */}
        <div className="p-4 text-center border-t">
          <Button
            onClick={addNewItem}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            ➕ Add New Line
          </Button>
        </div>

        {/* Footer Options */}
        <div className="p-4 border-t bg-gray-50 space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-blue-600 cursor-pointer">
              📈 Add Discount/Additional Charges
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-blue-600 cursor-pointer">📊 Summarize Total Quantity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};