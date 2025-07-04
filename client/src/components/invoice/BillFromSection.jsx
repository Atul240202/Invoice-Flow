import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Input } from "../Input";
import { Label } from "../Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select";
import { Button } from "../button";
import { X } from "lucide-react";

export const BillFromSection = ({ billFromData, setBillFromData }) => {
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  // Show/hide states for optional fields
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showGST, setShowGST] = useState(false);
  const [showPAN, setShowPAN] = useState(false);
  const [customFields, setCustomFields] = useState([]);

  const addCustomField = () => setCustomFields([...customFields, { label: "", value: "" }]);
  const removeCustomField = (idx) => setCustomFields(customFields.filter((_, i) => i !== idx));

  return (
    <>
      <Card className="bg-white border border-gray-200 rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-black">
            Billed By <span className="text-gray-500 text-sm font-normal">(Your Details)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Select value={billFromData.country} onValueChange={(value) => setBillFromData(prev => ({ ...prev, country: value }))}>
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
              value={billFromData.businessName}
              onChange={(e) => setBillFromData(prev => ({ ...prev, businessName: e.target.value }))}
              className="h-10 border-gray-300 focus:border-blue-500"
              placeholder="Your Business / Freelancer Name (Required)"
            />
          </div>

          <div className="space-y-2">
            <Input
              value={billFromData.address}
              onChange={(e) => setBillFromData(prev => ({ ...prev, address: e.target.value }))}
              className="h-10 border-gray-300 focus:border-blue-500"
              placeholder="Address (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              value={billFromData.city}
              onChange={(e) => setBillFromData(prev => ({ ...prev, city: e.target.value }))}
              className="h-10 border-gray-300 focus:border-blue-500"
              placeholder="City (optional)"
            />
            <Input
              value={billFromData.pincode}
              onChange={(e) => setBillFromData(prev => ({ ...prev, pincode: e.target.value }))}
              className="h-10 border-gray-300 focus:border-blue-500"
              placeholder="Postal Code / Zip Code"
            />
          </div>

          <div className="space-y-2">
            <Select value={billFromData.state} onValueChange={(value) => setBillFromData(prev => ({ ...prev, state: value }))}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="State (optional)" />
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
                value={billFromData.email}
                onChange={e => setBillFromData(prev => ({ ...prev, email: e.target.value }))}
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="Email"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEmail(false);
                  setBillFromData(prev => ({ ...prev, email: "" }));
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
                value={billFromData.phone}
                onChange={e => setBillFromData(prev => ({ ...prev, phone: e.target.value }))}
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="Phone Number"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPhone(false);
                  setBillFromData(prev => ({ ...prev, phone: "" }));
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
                value={billFromData.gstin}
                onChange={e => setBillFromData(prev => ({ ...prev, gstin: e.target.value }))}
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="GSTIN"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowGST(false);
                  setBillFromData(prev => ({ ...prev, gstin: "" }));
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
                value={billFromData.pan}
                onChange={e => setBillFromData(prev => ({ ...prev, pan: e.target.value }))}
                className="h-10 border-gray-300 focus:border-blue-500"
                placeholder="PAN"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPAN(false);
                  setBillFromData(prev => ({ ...prev, pan: "" }));
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