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



const handleLogoUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Only allow image files
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image (png/jpg).");
    return;
  }

  // 5 MB size limit
  const MAX_LOGO_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_LOGO_SIZE) {
    alert("Max file size 5 MB.");
    return;
  }

  // Store the File object and create preview URL
  setInvoiceData(prev => ({
    ...prev,
    businessLogo: file, // Store File object for upload
    businessLogoPreview: URL.createObjectURL(file) // Preview URL for display
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
                <div className="mt-4">
                  <img
                    src={invoiceData.businessLogo}
                    alt="Business Logo"
                    className="w-24 h-24 object-contain mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
