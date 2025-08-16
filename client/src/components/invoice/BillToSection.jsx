import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Input } from "../Input";
import { Label } from "../Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select";
import { Button } from "../button";
import { X } from "lucide-react";
import api from "../../utils/api";

// --- Add state-pincode mapping ---
const STATE_PINCODE_RANGES = {
  "Andhra Pradesh": [[500000, 534999]],
  "Arunachal Pradesh": [[790000, 792999]],
  "Assam": [[780000, 788999]],
  "Bihar": [[800000, 854999]],
  "Chhattisgarh": [[490000, 497999]],
  "Goa": [[403000, 403999]],
  "Gujarat": [[360000, 396999]],
  "Haryana": [[121000, 136999]],
  "Himachal Pradesh": [[171000, 177999]],
  "Jharkhand": [[815000, 834999]],
  "Karnataka": [[560000, 591999]],
  "Kerala": [[670000, 695999]],
  "Madhya Pradesh": [[450000, 488999]],
  "Maharashtra": [[400000, 444999]],
  "Manipur": [[795000, 795999]],
  "Meghalaya": [[793000, 794999]],
  "Mizoram": [[796000, 796999]],
  "Nagaland": [[797000, 798999]],
  "Odisha": [[751000, 769999]],
  "Punjab": [[140000, 160999]],
  "Rajasthan": [[301000, 345999]],
  "Sikkim": [[737000, 737999]],
  "Tamil Nadu": [[600000, 643999]],
  "Telangana": [[500000, 509999]],
  "Tripura": [[799000, 799999]],
  "Uttar Pradesh": [[201000, 285999]],
  "Uttarakhand": [[244000, 263999]],
  "West Bengal": [[700000, 743999]],
  // Add more if needed
};

function isPincodeValidForState(state, pincode) {
  if (!state || !pincode) return true; // Don't show error if not filled
  const ranges = STATE_PINCODE_RANGES[state];
  if (!ranges) return true; // If state not mapped, skip validation
  const pin = parseInt(pincode, 10);
  return ranges.some(([start, end]) => pin >= start && pin <= end);
}

export const BillToSection = ({
  billToData,
  setBillToData,
  selectedClientId,
  setSelectedClientId,
  pincodeError,
  emailError,
  setEmailError,
}) => {
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
  const [localPincodeError, setLocalPincodeError] = useState("");
 
  const validateEmail = (email) => {
    if (!email) return "Email is required";
    // Optional: Add format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    return "";
  };

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

  useEffect(() => {
    setShowEmail(!!billToData.email);
    setShowPhone(!!billToData.phone);
    setShowGST(!!billToData.gstin);
    setShowPAN(!!billToData.pan);
    setCustomFields(billToData.customFields || []);
  }, [billToData]);

  // --- Live pincode validation ---
  useEffect(() => {
    if (billToData.state && billToData.pincode) {
      if (!isPincodeValidForState(billToData.state, billToData.pincode)) {
        setLocalPincodeError("Pincode does not match the selected state.");
      } else {
        setLocalPincodeError("");
      }
    } else {
      setLocalPincodeError("");
    }
  }, [billToData.state, billToData.pincode]);

  const addCustomField = () => setCustomFields([...customFields, { label: "", value: "" }]);
  const removeCustomField = (idx) => setCustomFields(customFields.filter((_, i) => i !== idx));

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
            <div>
              <Input
                value={billToData.pincode}
                onChange={(e) => setBillToData(prev => ({ ...prev, pincode: e.target.value }))}
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="Postal Code / Zip Code"
              />
              {(localPincodeError || pincodeError) && (
                <div className="text-xs text-red-600 mt-1">
                  {localPincodeError || pincodeError}
                </div>
              )}
            </div>
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
          <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">
      Client Email <span className="text-red-500">*</span>
    </label>
    <Input
      value={billToData.email}
      onChange={e => {
        setBillToData(prev => ({ ...prev, email: e.target.value }));
        setEmailError(""); // clear error on change
      }}
      onBlur={e => {
        if (!e.target.value) setEmailError("Email is required");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) setEmailError("Invalid email format");
        else setEmailError("");
      }}
      className={`h-10 border-gray-300 focus:border-blue-500 ${emailError ? "border-red-500" : ""}`}
      placeholder="Client Email"
      required
    />
     {emailError && <span className="text-xs text-red-500">{emailError}</span>}
  </div>

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