import { useState } from "react";
import { Button } from "../components/button";
import { Badge } from "../components/Badge";
import { useToast } from "../hooks/toast";
import { InvoiceHeader } from "../components/invoice/InvoiceHeader";
import { BillFromSection } from "../components/invoice/BillFromSection";
import { ShippingDetails } from "../components/invoice/ShippingDetails";
import { GSTConfigModal } from "../components/invoice/GSTConfigModal";
import { ItemDetailsTable } from "../components/invoice/ItemDetailsTable";
import { TotalsSection } from "../components/invoice/TotalsSection";
import { ExtrasSection } from "../components/invoice/ExtrasSection";
import { BankingPreviewStep } from "../components/invoice/BankingPreviewStep";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import { Card, CardHeader, CardContent, CardTitle } from "../components/card";
import { Plus, X } from "lucide-react";
import { BillToSection } from "../components/invoice/BillToSection";
import api from "../utils/api";

const CreateInvoice = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showGSTModal, setShowGSTModal] = useState(false);
  const [showShippingDetails, setShowShippingDetails] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showEditFields, setShowEditFields] = useState(false); // FIX 1: Add this state
  const [numberFormat, setNumberFormat] = useState("indian");
  const [itemColumns, setItemColumns] = useState([
    { key: "item", label: "Item", visible: true },
    { key: "gstRate", label: "GST %", visible: true },
    { key: "quantity", label: "Quantity", visible: true },
    { key: "rate", label: "Rate", visible: true },
    { key: "amount", label: "Amount", visible: true },
  ]);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "A00001",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    businessLogo: null,
    currency: "INR",
    items: [],
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    discount: 0,
    additionalCharges: 0,
    grandTotal: 0,
    signature: null,
    terms: "",
    notes: "",
    attachments: [],
    contactDetails: ""
  });

  const [billFromData, setBillFromData] = useState({
    country: "India",
    businessName: "",
    phone: "",
    gstin: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    email: "",
    pan: ""
  });

  const [billToData, setBillToData] = useState({
    country: "India",
    businessName: "",
    phone: "",
    gstin: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    email: "",
    pan: ""
  });

  const [gstConfig, setGstConfig] = useState({
    taxType: "GST",
    placeOfSupply: "",
    gstType: "CGST+SGST"
  });

  const [shippingDetails, setShippingDetails] = useState({
    shippedFrom: {
      businessName: "",
      country: "India",
      address: "",
      city: "",
      state: ""
    },
    shippedTo: {
      businessName: "",
      country: "India",
      address: "",
      city: "",
      state: ""
    }
  });

  // FIX 3: Remove hsn from newItem
  const handleSaveAndContinue = async () => {
  const formData = new FormData();

  formData.append("invoiceNumber", invoiceData.invoiceNumber);
  formData.append("invoiceDate", invoiceData.date);
  formData.append("dueDate", invoiceData.dueDate);

  if (invoiceData.businessLogo) {
    formData.append("businessLogo", invoiceData.businessLogo);
  }

  formData.append("billFrom", JSON.stringify(billFromData));
  formData.append("billTo", JSON.stringify(billToData));
  formData.append("shipping", JSON.stringify(shippingDetails));
  formData.append("gstConfig", JSON.stringify(gstConfig));
  formData.append("items", JSON.stringify(invoiceData.items));
  formData.append("summary", JSON.stringify({
    subtotal: invoiceData.subtotal,
    cgst: invoiceData.cgst,
    sgst: invoiceData.sgst,
    discount: invoiceData.discount,
    totalAmount: invoiceData.grandTotal,
  }));
  formData.append("additionalOptions", JSON.stringify({
    terms: invoiceData.terms,
    notes: invoiceData.notes,
    attachments: [], 
    contactDetails: invoiceData.contactDetails,
  }));
  formData.append("currency", invoiceData.currency);
  formData.append("status", "draft");

  try {
    const token = localStorage.getItem("token"); 

    const res = await api.post("/invoices", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Invoice created:", res.data);
    toast({
      title: "Success",
      description: "Invoice created successfully.",
    });

    setCurrentStep(2); 
  } catch (error) {
    console.error("Error creating invoice:", error);
    toast({
      title: "Error",
      description: "Something went wrong while saving invoice.",
      variant: "destructive",
    });
  }
};

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Invoice saved as draft successfully",
    });
  };

  if (currentStep === 2) {
    return (
      <BankingPreviewStep
        invoiceData={invoiceData}
        billFromData={billFromData}
        billToData={billToData}
        gstConfig={gstConfig}
        shippingDetails={shippingDetails}
        onBack={() => setCurrentStep(1)}
      />
    );
  }

  // Show Edit Fields Modal (place before return)
  {itemColumns.map((col, idx) => (
  <div key={col.key} className="flex items-center gap-2 mb-2">
    {/* Label input */}
    <Input
      value={col.label}
      onChange={e => {
        const updated = [...itemColumns];
        updated[idx].label = e.target.value;
        setItemColumns(updated);
      }}
      className="flex-1"
      placeholder="Label"
    />
    {/* Optional: Key input (for advanced use or debugging) */}
    <Input
      value={col.key}
      onChange={e => {
        const updated = [...itemColumns];
        updated[idx].key = e.target.value.trim().replace(/\s+/g, '').toLowerCase();
        setItemColumns(updated);
      }}
      className="w-32"
      placeholder="Key"
    />
    <input
      type="checkbox"
      checked={col.visible}
      onChange={e => {
        const updated = [...itemColumns];
        updated[idx].visible = e.target.checked;
        setItemColumns(updated);
      }}
    />
  </div>
))}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start bg-white p-6 rounded-lg border shadow-sm">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
            <p className="text-gray-600">
              Generate professional GST-compliant invoices with our step-by-step process
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-2 border-blue-200 text-blue-700 bg-blue-50">
              Step 1 of 2
            </Badge>
          </div>
        </div>

        {/* Invoice Header */}
        <InvoiceHeader
          invoiceData={invoiceData}
          setInvoiceData={setInvoiceData}
        />

        {/* Bill From/To Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BillFromSection
            billFromData={billFromData}
            setBillFromData={setBillFromData}
          />
          <BillToSection
            billToData={billToData}
            setBillToData={setBillToData}
          />
        </div>

         {/* Modal for editing fields */}
         {showEditFields && (
  <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">🛠️ Customize Table Columns</h2>
        <button onClick={() => setShowEditFields(false)} className="text-gray-500 hover:text-black">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {itemColumns.map((col, idx) => (
          <div key={col.key} className="flex items-center gap-2">
            <Input
              value={col.label}
              onChange={(e) => {
                const updated = [...itemColumns];
                updated[idx].label = e.target.value;
                setItemColumns(updated);
              }}
              className="flex-1"
              placeholder="Label"
            />
            <Input
              value={col.key}
             onChange={(e) => {
  const updated = itemColumns.map((col, i) =>
    i === idx ? { ...col, key: e.target.value.trim().replace(/\s+/g, '').toLowerCase() } : col
  );
  setItemColumns(updated);
}}
              className="w-32"
              placeholder="Key"
            />
            <input
              type="checkbox"
              checked={col.visible}
              onChange={(e) => {
  const updated = itemColumns.map((col, i) =>
    i === idx ? { ...col, visible: e.target.checked } : col
  );
  setItemColumns(updated);
}}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={() => setItemColumns([
            ...itemColumns,
            {
              key: `custom${itemColumns.length}`,
              label: "New Field",
              visible: true
            }
          ])}
        >
          ➕ Add Field
        </Button>
        <Button onClick={() => setShowEditFields(false)}>Done</Button>
      </div>
    </div>
  </div>
)}

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-3 bg-white p-4 rounded-lg border shadow-sm">
          <Button
            onClick={() => setShowShippingDetails(!showShippingDetails)}
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            📦 Add Shipping Details
          </Button>
          <Button
            onClick={() => setShowGSTModal(true)}
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            💰 Add GST
          </Button>
          {/* FIX 2: Use Select directly, not inside Button */}
          <Select
            value={numberFormat}
            onValueChange={setNumberFormat}
          >
            <SelectTrigger className="w-56 border-gray-300 focus:border-blue-500">
              <SelectValue placeholder="Number Format" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg">
              <SelectItem value="indian">Indian (1,23,456.78)</SelectItem>
              <SelectItem value="international">International (123,456.78)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => setShowEditFields(true)}
          >
            ⚙️ Rename/Add Fields
          </Button>
        </div>

        {/* Shipping Details Section */}
        {showShippingDetails && (
          <ShippingDetails
            shippingDetails={shippingDetails}
            setShippingDetails={setShippingDetails}
          />
        )}

        {/* Currency Selection */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium text-gray-700">Currency:</Label>
              <Select
                value={invoiceData.currency}
                onValueChange={(value) => setInvoiceData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="w-60 border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  <SelectItem value="INR">Indian Rupees (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Item Details Section */}
        <Card className="border shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl text-gray-900">Item Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ItemDetailsTable
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
              gstConfig={gstConfig}
              numberFormat={numberFormat}
              itemColumns={itemColumns}
            />
          </CardContent>
        </Card>

        {/* Totals Section */}
        <TotalsSection
          invoiceData={invoiceData}
          setInvoiceData={setInvoiceData}
          gstConfig={gstConfig}
          numberFormat={numberFormat}
        />

        <ExtrasSection
          invoiceData={invoiceData}
          setInvoiceData={setInvoiceData}
        />

        {/* Advanced Options */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Advanced Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-gray-300" />
                Hide Place Of Supply/Country Of Supply
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-gray-300" />
                Add Original Images In Line Items
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-gray-300" />
                Show description in full width
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-6">
          <Button
            onClick={handleSaveDraft}
            variant="outline"
            size="lg"
            className="px-8 border-gray-300 hover:bg-gray-50"
          >
            Save as Draft
          </Button>
          <Button
            onClick={handleSaveAndContinue}
            size="lg"
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save & Continue
          </Button>
        </div>
      </div>

      {/* GST Configuration Modal */}
      <GSTConfigModal
        show={showGSTModal}
        onClose={() => setShowGSTModal(false)}
        gstConfig={gstConfig}
        setGstConfig={setGstConfig}
        billFromState={billFromData.state}
        billToState={billToData.state}
      />
    </div>
  );
};

export default CreateInvoice;