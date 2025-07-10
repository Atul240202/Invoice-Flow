import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Input } from "../Input";
import { Label } from "../Label";
import { Button } from "../button";
import { Upload, Calendar } from "lucide-react";

export const InvoiceHeader = ({ invoiceData, setInvoiceData }) => {

  const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });



  const handleLogoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const base64 = await toBase64(file);

  setInvoiceData(prev => ({
    ...prev,
    businessLogo: base64,         // for preview & PDF
    businessLogoFile: file,       // optional: if you need raw File later
  }));
};


  return (
    <Card className="bg-white border border-gray-200 rounded-lg">
      <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <CardTitle className="text-2xl font-semibold text-center text-black">Invoice</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Invoice No*</Label>
              <Input
                value={invoiceData.invoiceNumber}
                onChange={(e) =>
                  setInvoiceData((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                }
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="A00001"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Invoice Date*</Label>
              <Input
                type="date"
                value={invoiceData.date}
                onChange={(e) =>
                  setInvoiceData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="h-10 border-gray-300 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Due Date</Label>
              <Input
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) =>
                  setInvoiceData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="h-10 border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center w-full max-w-xs">
              <div className="text-gray-400 mb-2">📷</div>
              <p className="text-sm text-gray-500 mb-3">Add Business Logo</p>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <Button asChild variant="outline" size="sm" className="border-gray-300">
                <label htmlFor="logo-upload" className="cursor-pointer">
                  Choose File
                </label>
              </Button>
              {invoiceData.businessLogo && (
                <p className="text-xs text-green-600 mt-2">
                  {invoiceData.businessLogo.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
