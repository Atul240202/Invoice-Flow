import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Label } from "../Label";
import { Textarea } from "../Textarea";
import { Button } from "../button";
import { Upload, X } from "lucide-react";

export const ExtrasSection = ({ invoiceData, setInvoiceData }) => {
  const [showSignatureBox, setShowSignatureBox] = useState(false);
  const [showAttachmentBox, setShowAttachmentBox] = useState(false);
  const [showTerms, setShowTerms] = useState(!!invoiceData.terms);
  const [showNotes, setShowNotes] = useState(!!invoiceData.notes);
  const [showContact, setShowContact] = useState(!!invoiceData.contactDetails);

  const handleSignatureUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setInvoiceData((prev) => ({ ...prev, signature: file }));
      setShowSignatureBox(true);
    }
  };

  const handleRemoveSignature = () => {
    setInvoiceData((prev) => ({ ...prev, signature: null }));
    setShowSignatureBox(false);
  };

  const handleAttachmentUpload = (event) => {
    const files = Array.from(event.target.files || []);
    setInvoiceData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
    setShowAttachmentBox(true);
  };

  const handleRemoveAttachment = (idx) => {
    setInvoiceData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx),
    }));
    if (invoiceData.attachments.length === 1) setShowAttachmentBox(false);
  };

  const handleRemoveTerms = () => {
    setInvoiceData((prev) => ({ ...prev, terms: "" }));
    setShowTerms(false);
  };
  const handleRemoveNotes = () => {
    setInvoiceData((prev) => ({ ...prev, notes: "" }));
    setShowNotes(false);
  };
  const handleRemoveContact = () => {
    setInvoiceData((prev) => ({ ...prev, contactDetails: "" }));
    setShowContact(false);
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="pb-6 border-b border-slate-100">
        <CardTitle className="text-2xl text-slate-900 font-semibold">Additional Details</CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Top row: Terms, Notes, Contact */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Terms & Conditions */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Terms & Conditions
            </Label>
            {!showTerms && !invoiceData.terms && (
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200"
                onClick={() => setShowTerms(true)}
              >
                + Add Terms & Conditions
              </Button>
            )}
            {(showTerms || invoiceData.terms) && (
              <div className="relative">
                <Textarea
                  placeholder="Enter terms and conditions"
                  value={invoiceData.terms}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({ ...prev, terms: e.target.value }))
                  }
                  className="min-h-[100px] text-base pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500"
                  onClick={handleRemoveTerms}
                  title="Remove Terms & Conditions"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          {/* Notes */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Notes
            </Label>
            {!showNotes && !invoiceData.notes && (
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200"
                onClick={() => setShowNotes(true)}
              >
                + Add Notes
              </Button>
            )}
            {(showNotes || invoiceData.notes) && (
              <div className="relative">
                <Textarea
                  placeholder="Additional notes"
                  value={invoiceData.notes}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="min-h-[100px] text-base pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500"
                  onClick={handleRemoveNotes}
                  title="Remove Notes"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          {/* Contact Details */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Contact Details
            </Label>
            {!showContact && !invoiceData.contactDetails && (
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200"
                onClick={() => setShowContact(true)}
              >
                + Add Contact Details
              </Button>
            )}
            {(showContact || invoiceData.contactDetails) && (
              <div className="relative">
                <Textarea
                  placeholder="Additional contact information"
                  value={invoiceData.contactDetails}
                  onChange={(e) =>
                    setInvoiceData((prev) => ({ ...prev, contactDetails: e.target.value }))
                  }
                  className="min-h-[100px] text-base pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500"
                  onClick={handleRemoveContact}
                  title="Remove Contact Details"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* Bottom row: Attachments and Signature */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Attachments Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Add Attachments</Label>
            {!showAttachmentBox && (!invoiceData.attachments || invoiceData.attachments.length === 0) && (
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200"
                onClick={() => setShowAttachmentBox(true)}
              >
                + Add Attachments
              </Button>
            )}
            {(showAttachmentBox || (invoiceData.attachments && invoiceData.attachments.length > 0)) && (
              <div className="relative border-2 border-dashed border-blue-200 rounded-lg p-6 text-center bg-blue-50/30">
                <Upload className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">Upload additional files</p>
                <input
                  type="file"
                  multiple
                  onChange={handleAttachmentUpload}
                  className="hidden"
                  id="attachment-upload"
                />
                <Button asChild variant="outline" size="sm">
                  <label htmlFor="attachment-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
                {/* Remove button for the whole box */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500"
                  onClick={() => setShowAttachmentBox(false)}
                  title="Hide Attachments"
                >
                  <X className="w-4 h-4" />
                </Button>
                {invoiceData.attachments && invoiceData.attachments.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {invoiceData.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-center gap-2">
                        <span className="text-sm text-green-700 truncate max-w-[180px]">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleRemoveAttachment(idx)}
                          title="Remove attachment"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Signature Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Add Signature</Label>
            {!showSignatureBox && !invoiceData.signature && (
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200"
                onClick={() => setShowSignatureBox(true)}
              >
                + Add Signature
              </Button>
            )}
            {(showSignatureBox || invoiceData.signature) && (
              <div className="relative border-2 border-dashed border-blue-200 rounded-lg p-6 text-center bg-blue-50/30">
                <Upload className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">Upload or draw signature</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                  id="signature-upload"
                />
                <Button asChild variant="outline" size="sm">
                  <label htmlFor="signature-upload" className="cursor-pointer">
                    Choose File
                  </label>
                </Button>
                {/* Remove button for the whole box */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500"
                  onClick={() => setShowSignatureBox(false)}
                  title="Hide Signature"
                >
                  <X className="w-4 h-4" />
                </Button>
                {invoiceData.signature && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="text-sm text-green-700">{invoiceData.signature.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={handleRemoveSignature}
                      title="Remove signature"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};