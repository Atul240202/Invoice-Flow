import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../Dialog";
import { Button } from "../button";
import { Input } from "../Input";
import { Label } from "../Label"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select";
import { useEffect } from "react";

export const GSTConfigModal = ({
  show,
  onClose,
  gstConfig,
  setGstConfig,
  billFromState,
  billToState
}) => {
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  // Auto-detect GST type based on states, only if GST is enabled
  useEffect(() => {
    if (
      gstConfig.taxType === "GST" &&
      billFromState &&
      billToState
    ) {
      const gstType = billFromState === billToState ? "CGST+SGST" : "IGST";
      setGstConfig(prev => ({ ...prev, gstType }));
    }
  }, [billFromState, billToState, gstConfig.taxType, setGstConfig]);

  const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/gst-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(gstConfig),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to save GST config:", data.message);
    } else {
      console.log("GST config saved:", data);
      onClose();
    }
  } catch (error) {
    console.error("Error saving GST config:", error);
  }
};


  const gstEnabled = gstConfig.taxType === "GST";

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Configure GST Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Tax Type</Label>
            <Select
              value={gstConfig.taxType}
              onValueChange={(value) =>
                setGstConfig(prev => ({
                  ...prev,
                  taxType: value,
                  // Reset GST fields if GST is disabled
                  ...(value !== "GST" && { placeOfSupply: "", gstType: "" })
                }))
              }
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select Tax Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="GST">GST</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Place of Supply</Label>
            <Select
              value={gstConfig.placeOfSupply}
              onValueChange={(value) =>
                setGstConfig(prev => ({ ...prev, placeOfSupply: value }))
              }
              disabled={!gstEnabled}
            >
              <SelectTrigger className="h-12 text-base" disabled={!gstEnabled}>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {indianStates.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">GST Type</Label>
            <Select
              value={gstConfig.gstType}
              onValueChange={(value) =>
                setGstConfig(prev => ({ ...prev, gstType: value }))
              }
              disabled={!gstEnabled}
            >
              <SelectTrigger className="h-12 text-base" disabled={!gstEnabled}>
                <SelectValue placeholder="Select GST Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="CGST+SGST">CGST + SGST (Intra-state)</SelectItem>
                <SelectItem value="IGST">IGST (Inter-state)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {gstEnabled && billFromState && billToState && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                Auto-detected: {billFromState === billToState ? "CGST + SGST" : "IGST"}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Based on Bill From: {billFromState} and Bill To: {billToState}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient from-brightBlue to-brightCyan hover:from-blue-600 to-cyan-600 text-black "
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};