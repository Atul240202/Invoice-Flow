import { useState } from "react";
import { Card, CardContent } from "../card";
import { Button } from "../button";
import { Input } from "../Input";
import {
  Upload,
  FileText,
  ClipboardList,
  PhoneCall,
  Pencil,
} from "lucide-react";

export const ExtrasSection = ({ invoiceData, setInvoiceData }) => {
  const [showTerms, setShowTerms] = useState(!!invoiceData.terms);
  const [showNotes, setShowNotes] = useState(!!invoiceData.notes);
  const [showContact, setShowContact] = useState(!!invoiceData.contactDetails);
  const [showAttachments, setShowAttachments] = useState(!!invoiceData.attachments?.length);
  const [showSignature, setShowSignature] = useState(!!invoiceData.signature);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(!!invoiceData.additionalInfo);

  const handleFileUpload = (e, key) => {
    const files = Array.from(e.target.files || []);
    if (key === "attachments") {
      setInvoiceData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...files],
      }));
      setShowAttachments(true);
    } else if (key === "signature") {
      setInvoiceData((prev) => ({ ...prev, signature: files[0] }));
      setShowSignature(true);
    }
  };

  return (
    
     <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
  <CardContent className="p-2 space-y-1"> {/* Reduced from space-y-4 to space-y-2 */}
    <div className="grid grid-cols-2 md:grid-cols-2 gap-1"> {/* Reduced from gap-4 to gap-2 */}
      
      <Button
        onClick={() => setShowNotes((prev) => !prev)}
        variant="outline"
        className="justify-start text-blue-600 border-blue-200 w-full"
      >
         Add Notes
      </Button>
      <Button
        onClick={() => setShowAdditionalInfo((prev) => !prev)}
        variant="outline"
        className="justify-start text-blue-600 border-blue-200 w-full"
      >
         Add Additional Info
      </Button>
      
      <Button
        onClick={() => document.getElementById("attachment-upload")?.click()}
        variant="outline"
        className="justify-start text-blue-600 border-blue-200 w-full"
      >
         Add Attachments
      </Button>
      <Button
        onClick={() => document.getElementById("signature-upload")?.click()}
        variant="outline"
        className="justify-start text-blue-600 border-blue-200 w-full"
      >
         Add Signature
      </Button>
      <Button
        onClick={() => setShowTerms((prev) => !prev)}
        variant="outline"
        className="justify-start text-blue-600 border-blue-200 w-full"
      >
     Add Terms & Conditions
      </Button>
      
    
        <Button
        onClick={() => setShowContact((prev) => !prev)}
        variant="outline"
        className="justify-start text-blue-600 border-blue-200 w-full"
      >
     Add Contact Details
      </Button>
    </div>

    {/* You can add mt-2 or mt-3 for fine control of spacing below each section */}
    {showTerms && (
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Terms & Conditions
        </label>
        <textarea
          className="w-full p-2 border rounded text-sm"
          rows={3}
          placeholder="Enter terms and conditions"
          value={invoiceData.terms || ""}
          onChange={(e) =>
            setInvoiceData((prev) => ({ ...prev, terms: e.target.value }))
          }
        />
      </div>
    )}

    {showNotes && (
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          className="w-full p-2 border rounded text-sm"
          rows={3}
          placeholder="Enter any notes"
          value={invoiceData.notes || ""}
          onChange={(e) =>
            setInvoiceData((prev) => ({ ...prev, notes: e.target.value }))
          }
        />
      </div>
    )}

    {showContact && (
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Details
        </label>
        <textarea
          className="w-full p-2 border rounded text-sm"
          rows={2}
          placeholder="Enter contact details"
          value={invoiceData.contactDetails || ""}
          onChange={(e) =>
            setInvoiceData((prev) => ({
              ...prev,
              contactDetails: e.target.value,
            }))
          }
        />
      </div>
    )}

    {showAdditionalInfo && (
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Info
        </label>
        <textarea
          className="w-full p-2 border rounded text-sm"
          rows={2}
          placeholder="Enter any additional info"
          value={invoiceData.additionalInfo || ""}
          onChange={(e) =>
            setInvoiceData((prev) => ({
              ...prev,
              additionalInfo: e.target.value,
            }))
          }
        />
      </div>
    )}

    {showAttachments && invoiceData.attachments?.length > 0 && (
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Uploaded Attachments:
        </label>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {invoiceData.attachments.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>
      </div>
    )}

    {showSignature && invoiceData.signature && (
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Uploaded Signature:
        </label>
        <img
          src={URL.createObjectURL(invoiceData.signature)}
          alt="Signature"
          className="w-auto max-h-32 border rounded p-1"
        />
      </div>
    )}

    {/* Hidden file inputs */}
    <input
      type="file"
      multiple
      onChange={(e) => handleFileUpload(e, "attachments")}
      className="hidden"
      id="attachment-upload"
    />
    <input
      type="file"
      accept="image/*"
      onChange={(e) => handleFileUpload(e, "signature")}
      className="hidden"
      id="signature-upload"
    />
  </CardContent>

    </Card>
  );
};
