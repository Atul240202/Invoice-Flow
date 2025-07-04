import { Card, CardContent } from "../card";
import { Button } from "../button";
import { Input } from "../Input";
import { X, Plus } from "lucide-react";

function formatNumber(value, format = "indian") {
  if (isNaN(value)) return value;
  if (format === "indian") {
    return value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const ItemDetailsTable = ({
  invoiceData,
  setInvoiceData,
  gstConfig,
  itemColumns,
  numberFormat = "indian",
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
      };
    });
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-gray-100 text-sm font-semibold text-gray-700 border-b">
          {itemColumns.filter((c) => c.visible).map((col) => (
            <div key={col.key} className="col-span-2 truncate">{col.label}</div>
          ))}
          <div className="col-span-1"></div>
        </div>

        {/* Table Rows */}
        {invoiceData.items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-2 px-6 py-3 border-b hover:bg-gray-50 items-center"
          >
            {itemColumns.filter((c) => c.visible).map((col) => (
              <div key={col.key} className="col-span-2">
                {col.key === "item" && (
                  <Input
                    value={item.item}
                    onChange={(e) => updateItem(index, "item", e.target.value)}
                    className="h-8"
                    placeholder="Item name"
                  />
                )}
                {col.key === "gstRate" && (
                  <Input
                    type="number"
                    value={item.gstRate}
                    onChange={(e) =>
                      updateItem(index, "gstRate", parseFloat(e.target.value) || 0)
                    }
                    className="h-8 text-center"
                    placeholder="GST %"
                    min="0"
                    max="100"
                  />
                )}
                {col.key === "quantity" && (
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", parseInt(e.target.value) || 0)
                    }
                    className="h-8 text-center"
                  />
                )}
                {col.key === "rate" && (
                  <div className="flex items-center">
                    <span className="px-2 py-2 h-10 text-gray-500 bg-gray-100 border border-r-0 rounded-l text-sm">
                      ₹
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
                )}
                {col.key === "amount" && (
                  <span className="text-sm font-medium text-gray-700 px-2">
                    ₹{formatNumber(item.amount, numberFormat)}
                  </span>
                )}
                {!["item", "gstRate", "quantity", "rate", "amount"].includes(col.key) && (
                  <Input
                    value={item[col.key] || ""}
                    onChange={(e) => updateItem(index, col.key, e.target.value)}
                    className="h-8"
                  />
                )}
              </div>
            ))}
            <div className="col-span-1 text-center">
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
      </CardContent>
    </Card>
  );
};
