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
      total: 0
    };
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // FIX 4: Use applyGST for correct GST calculation
  const applyGST = (amount, rate) => {
    if (gstConfig.gstType === "IGST") {
      return { igst: (amount * rate) / 100, cgst: 0, sgst: 0 };
    }
    return {
      cgst: (amount * rate) / 200,
      sgst: (amount * rate) / 200,
      igst: 0
    };
  };

  const updateItem = (index, field, value) => {
    setInvoiceData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      // Calculate amounts
      const item = updatedItems[index];
      item.amount = item.quantity * item.rate;
      const gst = applyGST(item.amount, item.gstRate);
      item.cgst = gst.cgst;
      item.sgst = gst.sgst;
      item.igst = gst.igst;
      item.total = item.amount + item.cgst + item.sgst + item.igst;

      // Defensive checks for totals
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
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
        grandTotal
      };
    });
  };

  function formatNumber(value, format = "indian") {
    if (isNaN(value)) return value;
    if (format === "indian") {
      // Indian format
      return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    // International format
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const handleSaveAndContinue = () => {
    setCurrentStep(2);
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
  {showEditFields && (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Edit Table Columns</h2>
        {itemColumns.map((col, idx) => (
          <div key={col.key} className="flex items-center gap-2 mb-2">
            <Input
              value={col.label}
              onChange={e => {
                const updated = [...itemColumns];
                updated[idx].label = e.target.value;
                setItemColumns(updated);
              }}
              className="flex-1"
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
        <Button
          onClick={() => setItemColumns([...itemColumns, { key: `custom${itemColumns.length}`, label: "New Field", visible: true }])}
          className="mt-2"
        >
          + Add Field
        </Button>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowEditFields(false)}>Close</Button>
        </div>
      </div>
    </div>
  )}

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