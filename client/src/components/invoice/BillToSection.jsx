import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Input } from "../Input";
import { Label } from "../Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select";
import { Button } from "../button";
import { X } from "lucide-react";
import api from "../../utils/api";

export const BillToSection = ({ billToData, setBillToData, selectedClientId, setSelectedClientId }) => {
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showGST, setShowGST] = useState(false);
  const [showPAN, setShowPAN] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [clients, setClients] = useState([]);


  const addCustomField = () => setCustomFields([...customFields, { label: "", value: "" }]);
  const removeCustomField = (idx) => setCustomFields(customFields.filter((_, i) => i !== idx));

  useEffect(() => {
  const fetchClients = async () => {
    try {
      const res = await api.get("/clients");
      setClients(res.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  fetchClients();
}, []);

const handleClientSelect = (id) => {
  setSelectedClientId(id);
  const selected = clients.find((client) => client._id === id);
  if (selected) {
    setBillToData((prev) => ({
      ...prev,
      businessName: selected.name || "",
      address: selected.address || "",
      email: selected.email || "",
      phone: selected.phone || "",
      gstin: selected.gstNumber || "",
      state: "", 
      city: "", 
      pincode: "", 
    }));
  }
};


  return (
    <>
      <Card className="bg-white border border-gray-200 rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-black">
            Billed To <span className="text-gray-500 text-sm font-normal">(Client Details)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Select Saved Client</Label>
              <Select value={selectedClientId} onValueChange={handleClientSelect}>
              <SelectTrigger className="w-full h-10 border-gray-300 focus:border-blue-500">
              <SelectValue placeholder="Choose from saved clients..." />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60 overflow-y-auto">
                {clients.map((client) => (
              <SelectItem key={client._id} value={client._id}>
                {client.name} — {client.email}
              </SelectItem>
              ))}
              </SelectContent>
              </Select>
            </div>
            <Select value={billToData.country} onValueChange={(value) => setBillToData(prev => ({ ...prev, country: value }))}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="India" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="UK">UK</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Input
              value={billToData.businessName}
              onChange={(e) => setBillToData(prev => ({ ...prev, businessName: e.target.value }))}
              className="h-10 border-gray-300 focus:border-blue-500"
              placeholder="Client Business / Name (Required)"
            />
          </div>

          <div className="space-y-2">
            <Input
              value={billToData.address}
              onChange={(e) => setBillToData(prev => ({ ...prev, address: e.target.value }))}
              className="h-10 border-gray-300 focus:border-blue-500"
              placeholder="Address"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              value={billToData.city}
              onChange={(e) => setBillToData(prev => ({ ...prev, city: e.target.value }))}
              className="h-10 border-gray-300 focus:border-blue-500"
              placeholder="City"
            />
            <Input
              value={billToData.pincode}
              onChange={(e) => setBillToData(prev => ({ ...prev, pincode: e.target.value }))}
              className="h-10 border-gray-300 focus:border-blue-500"
              placeholder="Postal Code / Zip Code"
            />
          </div>

          <div className="space-y-2">
            <Select value={billToData.state} onValueChange={(value) => setBillToData(prev => ({ ...prev, state: value }))}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {indianStates.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Email */}
          {!showEmail ? (
            <Button variant="outline" className="text-blue-600 border-blue-200" onClick={() => setShowEmail(true)}>
              📧 Add Email
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                value={billToData.email}
                onChange={e => setBillToData(prev => ({ ...prev, email: e.target.value }))}
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="Email"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEmail(false);
                  setBillToData(prev => ({ ...prev, email: "" }));
                }}
                className="text-red-500"
                title="Remove Email"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Add Phone Number */}
          {!showPhone ? (
            <Button variant="outline" className="text-blue-600 border-blue-200" onClick={() => setShowPhone(true)}>
              📞 Add Phone Number
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                value={billToData.phone}
                onChange={e => setBillToData(prev => ({ ...prev, phone: e.target.value }))}
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="Phone Number"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPhone(false);
                  setBillToData(prev => ({ ...prev, phone: "" }));
                }}
                className="text-red-500"
                title="Remove Phone"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Add GST */}
          {!showGST ? (
            <Button variant="outline" className="text-blue-600 border-blue-200" onClick={() => setShowGST(true)}>
              🏛️ Add GST
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                value={billToData.gstin}
                onChange={e => setBillToData(prev => ({ ...prev, gstin: e.target.value }))}
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="GSTIN"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowGST(false);
                  setBillToData(prev => ({ ...prev, gstin: "" }));
                }}
                className="text-red-500"
                title="Remove GST"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Add PAN */}
          {!showPAN ? (
            <Button variant="outline" className="text-blue-600 border-blue-200" onClick={() => setShowPAN(true)}>
              📋 Add PAN
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                value={billToData.pan}
                onChange={e => setBillToData(prev => ({ ...prev, pan: e.target.value }))}
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="PAN"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPAN(false);
                  setBillToData(prev => ({ ...prev, pan: "" }));
                }}
                className="text-red-500"
                title="Remove PAN"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Custom Fields */}
          {customFields.map((field, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                value={field.label}
                onChange={e => {
                  const updated = [...customFields];
                  updated[idx].label = e.target.value;
                  setCustomFields(updated);
                }}
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="Custom Field Label"
              />
              <Input
                value={field.value}
                onChange={e => {
                  const updated = [...customFields];
                  updated[idx].value = e.target.value;
                  setCustomFields(updated);
                }}
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="Custom Field Value"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCustomField(idx)}
                className="text-red-500"
                title="Remove Custom Field"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" className="text-blue-600 border-blue-200" onClick={addCustomField}>
            ➕ Add Custom Field
          </Button>
        </CardContent>
      </Card>
    </>
  );
};