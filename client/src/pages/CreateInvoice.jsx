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
import  BankingPreviewStep  from "../components/invoice/BankingPreviewStep";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import { Card, CardHeader, CardContent, CardTitle } from "../components/card";
import { Plus, X } from "lucide-react";
import { BillToSection } from "../components/invoice/BillToSection";
import api from "../utils/api";
import { useEffect } from "react";
import axios from "axios";
import { exchangeRates, currencySymbols } from "../utils/currencyUtils";
import { useForm, FormProvider } from "react-hook-form";
import { useLocation } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const CreateInvoice = () => {
  const { toast } = useToast();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = !!id;
  const clientFromState = location.state?.client;
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showGSTModal, setShowGSTModal] = useState(false);
  const [showShippingDetails, setShowShippingDetails] = useState(false);
  const [numberFormat, setNumberFormat] = useState("indian");
  const [selectedClientId, setSelectedClientId] = useState("");

  const [itemColumns, setItemColumns] = useState([
    { key: "item", label: "Item", visible: true },
    { key: "gstRate", label: "GST %", visible: true },
    { key: "quantity", label: "Quantity", visible: true },
    { key: "rate", label: "Rate", visible: true },
    { key: "amount", label: "Amount", visible: true },
  ]);

  const methods = useForm({
    defaultValues: {
      invoiceNumber: "",
      date: "",
      dueDate: "",
      billFromData: { businessName: "", address: "", city: "", state: "", pincode: "", gstin: "", email: "" },
      billToData: { businessName: "", address: "", city: "", state: "", pincode: "", gstin: "" },
      items: [],
      cgst: 0,
      sgst: 0,
      igst: 0,
      discount: 0,
      additionalCharges: 0,
      terms: "",
      notes: "",
      signature: null,
      attachments: [],
      currency: "INR",
    },
  });

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
    discountPercentage: 0,
    additionalCharges: 0,
    grandTotal: 0,
    signature: null,
    terms: "",
    notes: "",
    attachments: [],
    contactDetails: "",
    qrImage: null,
    saveAsClient: false,
  });

  const [billFromData, setBillFromData] = useState({ country: "India",
    businessName: "",
    phone: "",
    gstin: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    email: "",
    pan: ""  });
  const [billToData, setBillToData] = useState({ country: "India",
    businessName: "",
    phone: "",
    gstin: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    email: "",
    pan: "" });
  const [gstConfig, setGstConfig] = useState({ taxType: "GST",
    placeOfSupply: "",
    gstType: "CGST+SGST"});
  const [shippingDetails, setShippingDetails] = useState({ shippedFrom: {
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
    }  });

  const conversionRate = exchangeRates[invoiceData.currency] || 1;
  const currencySymbol = currencySymbols[invoiceData.currency] || "₹";

  useEffect(() => {
    const fetchBillFromData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/settings/bill-from", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data?.billFrom) {
          setBillFromData(res.data.billFrom);
        }
      } catch (error) {
        console.error("Failed to fetch bill-from data:", error);
      }
    };

    fetchBillFromData();

     console.log("clientFromState:", clientFromState);

    if (clientFromState) {
      console.log("Client passed via state:", clientFromState);
      setSelectedClientId(clientFromState._id);
      setBillToData((prev) => ({
        ...prev,
        businessName: clientFromState.name || "",
        email: clientFromState.email || "",
        gstin: clientFromState.gstNumber || "",
        address: clientFromState.address || "",
        phone: clientFromState.phone || "",
      }));
    }
  }, []);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!isEditing) return;
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setInvoiceData(data.invoiceData || {});
        setBillFromData(data.billFrom || {});
        setBillToData(data.billTo || {});
        setShippingDetails(data.shipping || {});
        setGstConfig(data.gstConfig || {});
        setSelectedClientId(data.billToDetail || "");
        methods.reset(data.invoiceData || {});
      } catch (err) {
        console.error("Failed to load invoice:", err);
        toast({
          title: "Failed to load invoice",
          description: err.response?.data?.message || "An error occurred",
          variant: "destructive",
        });
      }
    };
    fetchInvoiceData();
  }, [isEditing, id]);

  useEffect(() => {
  console.log("currentStep updated to:", currentStep);
}, [currentStep]);


  const handleSaveAndContinue = async () => {
    console.log("Save and continue")
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("invoiceNumber", invoiceData?.invoiceNumber || "");
      formData.append("invoiceDate", invoiceData?.date || "");
      formData.append("dueDate", invoiceData?.dueDate || "");

      if (invoiceData?.businessLogo) formData.append("businessLogo", invoiceData.businessLogo);
      if (invoiceData?.qrImage) formData.append("qrImage", invoiceData.qrImage);
      invoiceData.attachments?.forEach((file) => formData.append("attachments", file));
      if (invoiceData?.signature) formData.append("signature", invoiceData.signature);

      if (!selectedClientId?.trim() && !billToData.businessName?.trim()) {
  toast({
    title: "Missing Recipient Info",
    description: "Please select a client or manually fill in the Bill To section.",
    variant: "destructive",
  });
  return;
}
      
console.log("Selected Client ID:", selectedClientId);

      formData.append("billFrom", JSON.stringify(billFromData));
      formData.append("billTo", JSON.stringify(billToData));
      formData.append("billToDetail", selectedClientId);
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
        additionalInfo: invoiceData.additionalInfo || "",
      }));
      formData.append("currency", invoiceData.currency);
      formData.append("status", "draft");
      formData.append("saveAsClient", invoiceData.saveAsClient);

      // Save bill-from data
      await axios.post("http://localhost:5000/api/settings/bill-from", billFromData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let res;
      if (isEditing) {
        res = await api.put(`/invoices/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
      } else {
        res = await api.post("/invoices", formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
      }

      toast({
        title: "Success",
        description: isEditing ? "Invoice updated successfully." : "Invoice created successfully.",
      });
      console.log("Current Step:", currentStep);
      setCurrentStep(2);
      console.log("Going to Step 2");
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

  return (
    <FormProvider {...methods}>

        {currentStep === 2 ? (
      <BankingPreviewStep
        invoiceData={invoiceData}
        billFromData={billFromData}
        billToData={billToData}
        gstConfig={gstConfig}
        shippingDetails={shippingDetails}
        onBack={() => setCurrentStep(1)}
      />
    ) : (
      
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start bg-white p-6 rounded-lg border shadow-sm">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? "Edit Invoice" : "Create Invoice"}
            </h1>
            <p className="text-gray-600">
              Generate professional GST-compliant invoices with our step-by-step process
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-2 border-blue-200 text-blue-700 bg-blue-50">
              {isEditing ? "Editing Invoice" : "Step 1 of 2"}
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
              conversionRate={conversionRate}
              currencySymbol={currencySymbol}
            />
          </CardContent>
        </Card>

        {/* Totals Section */}
        <TotalsSection
          invoiceData={invoiceData}
          setInvoiceData={setInvoiceData}
          gstConfig={gstConfig}
          numberFormat={numberFormat}
          conversionRate={conversionRate}
          currencySymbol={currencySymbol}
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
     )}
    </FormProvider>
  );
};

export default CreateInvoice;