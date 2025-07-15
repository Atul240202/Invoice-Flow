import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Input } from "../Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select";
import { Button } from "../button";
import { X } from "lucide-react";
import axios from "axios";

export const BillFromSection = ({ billFromData, setBillFromData }) => {
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
          <Input
            value={billFromData.pincode ?? ""}
            onChange={e => setBillFromData(prev => ({ ...prev, pincode: e.target.value }))}
            placeholder="Postal Code / Zip Code"
          />
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
