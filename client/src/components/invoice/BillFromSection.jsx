import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Input } from "../Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select";
import { Button } from "../button";
import { X } from "lucide-react";
import axios from "axios";

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

export const BillFromSection = ({ billFromData, setBillFromData, pincodeError }) => {
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showGST,  setShowGST]  = useState(false);
  const [showPAN,  setShowPAN]  = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [localPincodeError, setLocalPincodeError] = useState("");

  useEffect(() => {
    setShowEmail(!!billFromData.email);
    setShowPhone(!!billFromData.phone);
    setShowGST  (!!billFromData.gstin);
    setShowPAN  (!!billFromData.pan);
    setCustomFields(billFromData.customFields || []);
  }, [billFromData]);

  const [errors, setErrors] = useState({ email: "", phone: "", gstin: "", pan: "" });

  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
        break;
      case "phone":
        if (value && !/^\d{10}$/.test(value)) error = "Phone must be 10 digits";
        break;
      case "gstin":
        if (value && value.length !== 15) error = "GSTIN must be 15 characters";
        break;
      case "pan":
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) error = "Invalid PAN format";
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // --- Live pincode validation ---
  useEffect(() => {
    if (billFromData.state && billFromData.pincode) {
      if (!isPincodeValidForState(billFromData.state, billFromData.pincode)) {
        setLocalPincodeError("Pincode does not match the selected state.");
      } else {
        setLocalPincodeError("");
      }
    } else {
      setLocalPincodeError("");
    }
  }, [billFromData.state, billFromData.pincode]);

  const handleCustomFieldChange = (index, field, value) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
    setBillFromData(prev => ({ ...prev, customFields: updated }));
  };

  const addCustomField = () => {
    const updated = [...customFields, { label: "", value: "" }];
    setCustomFields(updated);
    setBillFromData(prev => ({ ...prev, customFields: updated }));
  };

  const removeCustomField = (idx) => {
    const updated = customFields.filter((_, i) => i !== idx);
    setCustomFields(updated);
    setBillFromData(prev => ({ ...prev, customFields: updated }));
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-black">
          Billed By <span className="text-gray-500 text-sm font-normal">(Your Details)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={billFromData.country ?? ""}
          onValueChange={val => setBillFromData(prev => ({ ...prev, country: val }))}
        >
          <SelectTrigger className="h-10 border-gray-300">
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="India">India</SelectItem>
            <SelectItem value="USA">USA</SelectItem>
            <SelectItem value="UK">UK</SelectItem>
          </SelectContent>
        </Select>

        <Input
          value={billFromData.businessName ?? ""}
          onChange={e => setBillFromData(prev => ({ ...prev, businessName: e.target.value }))}
          placeholder="Your Business / Freelancer Name (Required)"
        />

        <Input
          value={billFromData.address ?? ""}
          onChange={e => setBillFromData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Address (optional)"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            value={billFromData.city ?? ""}
            onChange={e => setBillFromData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="City (optional)"
          />
          <div>
            <Input
              value={billFromData.pincode ?? ""}
              onChange={e => setBillFromData(prev => ({ ...prev, pincode: e.target.value }))}
              placeholder="Postal Code / Zip Code"
            />
            {(localPincodeError || pincodeError) && (
              <div className="text-xs text-red-600 mt-1">
                {localPincodeError || pincodeError}
              </div>
            )}
          </div>
        </div>

        <Select
          value={billFromData.state ?? ""} 
          onValueChange={(val) => setBillFromData(prev => ({ ...prev, state: val }))}
        >
          <SelectTrigger className="h-10 border-gray-300">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent>
            {indianStates.map(state => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Optional Fields with Validation */}
        {showEmail ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Input
                value={billFromData.email}
                onChange={e => {
                  const val = e.target.value;
                  setBillFromData(prev => ({ ...prev, email: val }));
                  validateField("email", val);
                }}
                placeholder="Email"
                className={errors.email ? "border-red-500" : ""}
              />
              <Button variant="ghost" size="sm" onClick={() => {
                setShowEmail(false);
                setBillFromData(prev => ({ ...prev, email: "" }));
                setErrors(prev => ({ ...prev, email: "" }));
              }}>
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
            {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowEmail(true)}>📧 Add Email</Button>
        )}

        {showPhone ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Input
                value={billFromData.phone}
                onChange={e => {
                  const val = e.target.value;
                  setBillFromData(prev => ({ ...prev, phone: val }));
                  validateField("phone", val);
                }}
                placeholder="Phone Number"
                className={errors.phone ? "border-red-500" : ""}
              />
              <Button variant="ghost" size="sm" onClick={() => {
                setShowPhone(false);
                setBillFromData(prev => ({ ...prev, phone: "" }));
                setErrors(prev => ({ ...prev, phone: "" }));
              }}>
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
            {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowPhone(true)}>📞 Add Phone Number</Button>
        )}

        {showGST ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Input
                value={billFromData.gstin}
                onChange={e => {
                  const val = e.target.value;
                  setBillFromData(prev => ({ ...prev, gstin: val }));
                  validateField("gstin", val);
                }}
                placeholder="GSTIN"
                className={errors.gstin ? "border-red-500" : ""}
              />
              <Button variant="ghost" size="sm" onClick={() => {
                setShowGST(false);
                setBillFromData(prev => ({ ...prev, gstin: "" }));
                setErrors(prev => ({ ...prev, gstin: "" }));
              }}>
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
            {errors.gstin && <span className="text-xs text-red-500">{errors.gstin}</span>}
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowGST(true)}>🏛️ Add GST</Button>
        )}

        {showPAN ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Input
                value={billFromData.pan}
                onChange={e => {
                  const val = e.target.value.toUpperCase();
                  setBillFromData(prev => ({ ...prev, pan: val }));
                  validateField("pan", val);
                }}
                placeholder="PAN"
                className={errors.pan ? "border-red-500" : ""}
              />
              <Button variant="ghost" size="sm" onClick={() => {
                setShowPAN(false);
                setBillFromData(prev => ({ ...prev, pan: "" }));
                setErrors(prev => ({ ...prev, pan: "" }));
              }}>
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
            {errors.pan && <span className="text-xs text-red-500">{errors.pan}</span>}
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowPAN(true)}>📋 Add PAN</Button>
        )}

        {/* Custom Fields */}
        {customFields.map((field, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              value={field.label}
              onChange={e => handleCustomFieldChange(idx, "label", e.target.value)}
              placeholder="Custom Field Label"
            />
            <Input
              value={field.value}
              onChange={e => handleCustomFieldChange(idx, "value", e.target.value)}
              placeholder="Custom Field Value"
            />
            <Button variant="ghost" size="sm" onClick={() => removeCustomField(idx)}>
              <X className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addCustomField}>
          ➕ Add Custom Field
        </Button>
      </CardContent>
    </Card>
  );
};
