import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Separator } from "../separator";
import { useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { Switch } from "../Switch";
import { ChevronUp, ChevronDown, Printer, Download, Mail, Trash2 } from "lucide-react";
import { Button } from "../button";
import axios from "axios";
import { useToast } from "../../hooks/toast";
import { Label } from "../Label";
import { Input } from "../Input";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const parseSafe = (val) => {
  if (!val && val !== "") return null;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

const BankingPreviewStep = ({
  invoiceData = {},
  billFromData = {},
  billToData = {},
  goToStep,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [bankingDetails, setBankingDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
    accountType: "",
    upiIds: [""],
  });

  const [qrSrc, setQrSrc] = useState(null);
  const objectUrlRef = useRef(null);

  const handleClick = () => {
    goToStep(2); // or whatever step number you want
  };

  if (!invoiceData) {
    console.warn("invoiceData is missing.");
    return (
      <div className="text-center py-8 text-gray-600">
        Loading invoice preview...
      </div>
    );
  }

  const items = invoiceData.items ?? [];

  if (!Array.isArray(items)) {
    console.warn("invoiceData.items is not an array.");
    return (
      <div className="text-center py-8 text-gray-600">
        Loading invoice preview...
      </div>
    );
  }

  const formatCurrency = (amount) => {
    const symbol = invoiceData.currency === "INR" ? "₹" : "$";
    return `${symbol}${amount.toFixed(2)}`;
  };

  const calculateItemTotal = (item) => item.quantity * item.rate;

  const safeFormatDate = (value) => {
    const date = new Date(value);
    return value && !isNaN(date.getTime()) ? format(date, "PPP") : "-";
  };

  // --- MODIFIED: Always fetch user default bank details on mount ---
  useEffect(() => {
    // cleanup previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!invoiceData) {
      setQrSrc(null);
      return;
    }

    // 1) QR source resolution
    // priority:
    // - additionalOptions.qrImage (server path or data URI)
    // - invoiceData.qrImage (base64 or path)
    // - invoiceData.qrImageUrl / qrPreviewUrl
    // - invoiceData.qrFile (File instance)
    const addOpts = parseSafe(invoiceData.additionalOptions) || {};
    const candidate =
      addOpts.qrImage ||
      invoiceData.qrImage ||
      invoiceData.qrImageUrl ||
      invoiceData.qrPreviewUrl ||
      null;

    if (candidate) {
      // If it's a data URI use directly
      if (typeof candidate === "string" && candidate.startsWith("data:")) {
        setQrSrc(candidate);
      } else if (candidate instanceof File) {
        const url = URL.createObjectURL(candidate);
        objectUrlRef.current = url;
        setQrSrc(url);
      } else {
        // assume server path like "uploads/xxx.jpg" or "uploads\\xxx.jpg"
        let cleaned = String(candidate).replace(/\\/g, "/").replace(/^\/+/, "");
        setQrSrc(`${API_BASE}/${cleaned}`);
      }
    } else if (invoiceData.qrFile instanceof File) {
      const url = URL.createObjectURL(invoiceData.qrFile);
      objectUrlRef.current = url;
      setQrSrc(url);
    } else {
      setQrSrc(null);
    }
  }, [invoiceData]);

  // --- MODIFIED: Always fetch user default bank details on mount ---
  useEffect(() => {
    let didCancel = false;

    const fetchDefaultBankDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/settings/bank-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userBankDetails = res.data.bankDetails || {};

        // Only update if invoiceData does not have its own bank details
        const addOpts = parseSafe(invoiceData.additionalOptions) || {};
        const rootBank = parseSafe(invoiceData.bankDetails) || {};
        const additionalBank = parseSafe(addOpts.bankDetails) || {};

        const hasInvoiceBank =
          Object.keys(rootBank).length > 0 ||
          Object.keys(additionalBank).length > 0;

        if (!hasInvoiceBank && !didCancel) {
          setBankingDetails((prev) => ({
            ...prev,
            accountHolderName: userBankDetails.accountHolderName || "",
            accountNumber: userBankDetails.accountNumber || "",
            ifsc: userBankDetails.ifsc || "",
            bankName: userBankDetails.bankName || "",
            accountType: userBankDetails.accountType || "",
            upiIds: userBankDetails.upiIds && userBankDetails.upiIds.length > 0
              ? userBankDetails.upiIds
              : [""],
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user default bank details:", err);
      }
    };

    fetchDefaultBankDetails();

    return () => {
      didCancel = true;
    };
  }, [invoiceData]);

  // --- MODIFIED: Always resolve invoiceData's bank details if present ---
  useEffect(() => {
    // 2) Bank / UPI details resolution
    // check multiple possible locations and formats
    const addOpts = parseSafe(invoiceData.additionalOptions) || {};
    const rootBank = parseSafe(invoiceData.bankDetails) || {};
    const additionalBank = parseSafe(addOpts.bankDetails) || {};
    // some users may store upi under root upiDetails or additionalOptions.upiDetails or in bank object
    const rootUpi = parseSafe(invoiceData.upiDetails) || {};
    const additionalUpi = parseSafe(addOpts.upiDetails) || {};

    const resolved = {
      accountHolderName:
        rootBank.accountHolderName ||
        rootBank.accountHolder ||
        additionalBank.accountHolderName ||
        additionalBank.accountHolder ||
        "",
      accountNumber:
        rootBank.accountNumber ||
        rootBank.account ||
        additionalBank.accountNumber ||
        additionalBank.account ||
        "",
      ifsc:
        rootBank.ifsc ||
        rootBank.ifscCode ||
        additionalBank.ifsc ||
        additionalBank.ifscCode ||
        "",
      bankName:
        rootBank.bankName ||
        rootBank.bank ||
        additionalBank.bankName ||
        additionalBank.bank ||
        "",
      accountType: rootBank.accountType || additionalBank.accountType || "",
      // UPI: check multiple shapes: upiIds array, upiId string, upiDetails object with upiId
      upiIds:
        (Array.isArray(rootBank.upiIds) && rootBank.upiIds.length && rootBank.upiIds) ||
        (Array.isArray(additionalBank.upiIds) && additionalBank.upiIds.length && additionalBank.upiIds) ||
        (rootUpi.upiId ? [rootUpi.upiId] : rootUpi?.upiIds || []) ||
        (additionalUpi.upiId ? [additionalUpi.upiId] : additionalUpi?.upiIds || []),
    };

    // If any field is present, override the bankingDetails state
    const hasAny =
      resolved.accountHolderName ||
      resolved.accountNumber ||
      resolved.ifsc ||
      resolved.bankName ||
      resolved.accountType ||
      (resolved.upiIds && resolved.upiIds.length > 0 && resolved.upiIds[0]);

    if (hasAny) {
      setBankingDetails((prev) => ({
        ...prev,
        ...resolved,
        upiIds:
          resolved.upiIds && resolved.upiIds.length > 0
            ? resolved.upiIds
            : [""],
      }));
    }
  }, [invoiceData]);

  // Save bank details to DB (calls your existing update endpoint)
  const handleSaveBankDetails = async (data) => {
    setBankingDetails(data);
    setShowBankForm(false);

    if (!invoiceData?._id) {
      toast?.({
        title: "Not saved",
        description: "Invoice has no ID yet.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // server update expects JSON strings for bankDetails / upiDetails in your existing update handler
      const payload = {
        bankDetails: JSON.stringify(data),
        upiDetails: JSON.stringify({ upiId: data.upiIds?.[0] || "" }),
      };

      await axios.put(`${API_BASE}/api/invoices/${invoiceData._id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast?.({
        title: "Saved",
        description: "Bank details saved to invoice.",
      });
    } catch (err) {
      console.error("Failed to save bank details:", err);
      toast?.({
        title: "Save failed",
        description: "Unable to save bank details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDefaultBankDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/api/settings/bank-details`, bankingDetails, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast?.({ title: "Saved", description: "Default bank details updated." });
    } catch (err) {
      console.error("Failed to save default bank details:", err);
      toast?.({ title: "Save failed", variant: "destructive" });
    }
  };

  const totalItemsAmount =
    invoiceData.items?.reduce((acc, item) => acc + calculateItemTotal(item), 0) ||
    0;

  const totalTaxes =
    (invoiceData.cgst || 0) + (invoiceData.sgst || 0) + (invoiceData.igst || 0);

  const grandTotal =
    totalItemsAmount +
    totalTaxes +
    (invoiceData.additionalCharges || 0) -
    (invoiceData.discount || 0);

  const handlePrint = () => {
    window.print();
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onloadend = () => {
      // Save base64 string to invoiceData
      setInvoiceData((prev) => ({
        ...prev,
        businessLogo: reader.result, // e.g., "data:image/png;base64,AAAA..."
      }));
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const downloadPDF = async (invoice, setLoading, toast) => {
    if (!invoice || !invoice._id) {
      toast?.({
        title: "Download Failed",
        description: "Invoice ID is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `http://localhost:5000/api/invoices/${invoice._id}/download-pdf`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoice._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("PDF Download Error:", err);
      toast?.({
        title: "Download Failed",
        description: "Unable to generate PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = () => {
    // Add email sending logic
    alert("Send email logic goes here");
  };

/*  const handleSaveBankDetails = async () => {
    if (!invoice._id) {
      toast({ title: "Missing invoice ID", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/invoices/${invoice._id}/bank-details`,
        { bankingDetails }, // backend should merge this into invoice.bankingDetails
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({ title: "Bank details saved!" });
    } catch (err) {
      console.error("Save error:", err);
      toast({ title: "Error saving bank details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }; */


  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4">
      <Card className="shadow-lg border border-gray-200 rounded-2xl">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-3xl font-bold text-slate-900">
            Invoice Preview
          </CardTitle>
        </CardHeader>

        <Button variant="outline" onClick={() => goToStep(1)} className="mb-4">
          ← Back to Form
        </Button>

        <CardContent className="space-y-10 pt-8 text-slate-800 font-sans">
          {/* === Header: Invoice Title + Info === */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b pb-6">
            <div>
              <h1 className="text-5xl  text-purple-700 font-extrabold uppercase tracking-tight mb-3">
                Invoice
              </h1>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Invoice No:</span>{" "}
                  <span className="text-black font-medium">
                    #{invoiceData.invoiceNumber}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Invoice Date:</span>{" "}
                  <span className="text-black font-medium">
                    {safeFormatDate(invoiceData.date)}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Due Date:</span>{" "}
                  <span className="text-black font-medium">
                    {safeFormatDate(invoiceData.dueDate)}
                  </span>
                </p>
              </div>
            </div>

            {/* Logo */}
            {invoiceData.businessLogo && (
              <div className="mt-6 md:mt-0">
                {invoiceData.businessLogo && (
                  <>
                    <p className="text-xs text-green-600 mt-2">
                      {invoiceData.businessLogoFile?.name}
                    </p>
                    <img
                      src={invoiceData.businessLogo}
                      alt="Business Logo"
                      className="mt-3 h-25 w-32 mx-auto rounded shadow-sm border"
                    />
                  </>
                )}
              </div>
            )}
          </div>
          {/* === Billing Info === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Billed By */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 shadow-sm">
              <h3 className="uppercase font-bold text-purple-700 mb-2">
                Billed By
              </h3>
              <p className="font-semibold text-slate-900">
                {billFromData?.businessName}
              </p>
              <p>
                {billFromData?.address}, {billFromData?.city},{" "}
                {billFromData?.state}, India - {billFromData?.pincode}
              </p>

              {invoiceData.billFromData?.gstin && (
                <p className="text-slate-700 mt-1">
                  GSTIN: {billFromData.gstin}
                </p>
              )}
              {invoiceData.billFromData?.pan && (
                <p className="text-slate-700">PAN: {billFromData.pan}</p>
              )}
            </div>

            {/* Billed To */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 shadow-sm">
              <h3 className="uppercase font-bold text-purple-700 mb-2">
                Billed To
              </h3>
              <p className="font-semibold text-slate-900">
                {billToData?.businessName}
              </p>
              <p className="text-slate-700 whitespace-pre-wrap leading-snug">
                {billToData?.address}, {billToData?.city},{" "}
                {billToData?.state}, India - {billToData?.pincode}
              </p>
              {billToData?.gstin && (
                <p className="text-slate-700 mt-1">
                  GSTIN: {billToData.gstin}
                </p>
              )}
            </div>
          </div>

          {/* === Items Table === */}
          <div className="rounded-xl border overflow-hidden shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-purple-200 text-purple-900 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-right">GST %</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items?.map((item, idx) => (
                  <tr
                    key={idx}
                    className={
                      idx % 2 === 0
                        ? "bg-purple-50 text-slate-800"
                        : "bg-white text-slate-800"
                    }
                  >
                    <td className="px-4 py-3">{item.item}</td>
                    <td className="px-4 py-3 text-right">
                      {item.gstRate || 0}%
                    </td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(item.quantity * item.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          {/* === Totals Section === */}
          <div className="flex justify-end mt-6">
            <div className="w-full md:w-1/2 lg:w-1/3 border rounded-xl bg-purple-50 p-5 space-y-3 shadow-sm">
              {/* Divider with "Total" label centered */}
              <div className="flex items-center justify-between mb-2">
                <hr className="flex-grow border-purple-300" />
                <span className="px-3 text-sm font-semibold text-purple-700">
                  TOTAL
                </span>
                <hr className="flex-grow border-purple-300" />
              </div>

              {/* Line Items */}
              <div className="text-sm text-slate-800 space-y-1">
                <p className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <strong>{formatCurrency(totalItemsAmount)}</strong>
                </p>
                {invoiceData.igst > 0 && (
                  <p className="flex justify-between">
                    <span className="text-gray-500">IGST:</span>
                    <strong>{formatCurrency(invoiceData.igst)}</strong>
                  </p>
                )}
                {invoiceData.sgst > 0 && (
                  <p className="flex justify-between">
                    <span className="text-gray-500">SGST:</span>
                    <strong>{formatCurrency(invoiceData.sgst)}</strong>
                  </p>
                )}
                {invoiceData.cgst > 0 && (
                  <p className="flex justify-between">
                    <span className="text-gray-500">CGST:</span>
                    <strong>{formatCurrency(invoiceData.cgst)}</strong>
                  </p>
                )}
                {invoiceData.discount > 0 && (
                  <p className="flex justify-between">
                    <span className="text-gray-500">Discount:</span>
                    <span className="text-red-600 font-semibold">
                      -{formatCurrency(invoiceData.discount)}
                    </span>
                  </p>
                )}
                {invoiceData.additionalCharges > 0 && (
                  <p className="flex justify-between">
                    <span className="text-gray-500">Additional Charges:</span>
                    <strong>
                      {formatCurrency(invoiceData.additionalCharges)}
                    </strong>
                  </p>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-2 border-t border-purple-200">
                <p className="text-right text-lg font-bold text-purple-900 mt-2">
                  Grand Total: {formatCurrency(grandTotal)}
                </p>
              </div>
            </div>
          
</div>


          {/* === Totals + Bank + Signature === */}
          <div className="grid md:grid-cols-2 gap-4 border-t pt-6 text-sm">
            {/* === Bank Details on LHS === */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 shadow-sm">
              <h3 className="uppercase font-semibold text-purple-700 mb-3">
                Bank Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-y-1 text-gray-800">
                {bankingDetails && (
                  <>
                    {bankingDetails.accountHolderName && (
                      <p>
                        <strong>Account Name:</strong>{" "}
                        {bankingDetails.accountHolderName}
                      </p>
                    )}
                    {bankingDetails.accountNumber && (
                      <p>
                        <strong>Account Number:</strong>{" "}
                        {bankingDetails.accountNumber}
                      </p>
                    )}
                    {bankingDetails.ifsc && (
                      <p>
                        <strong>IFSC:</strong> {bankingDetails.ifsc}
                      </p>
                    )}
                    {bankingDetails.bankName && (
                      <p>
                        <strong>Bank:</strong> {bankingDetails.bankName}
                      </p>
                    )}
                    {bankingDetails.accountType && (
                      <p>
                        <strong>Account Type:</strong>{" "}
                        {bankingDetails.accountType}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>


            {/* === Signature on RHS === */}
            {invoiceData.signature && (
              <div className="text-right flex flex-col justify-end items-end mt-2">
                <p className="text-sm text-gray-600 mb-1">
                  Authorized Signatory
                </p>
                <img
                  src={URL.createObjectURL(invoiceData.signature)}
                  alt="Signature"
                  className="h-24 w-48  inline-block border border-gray-300 rounded shadow-sm"
                />
              </div>
            )}
          </div>

          {/* === Terms and Conditions Full Width === */}
          {invoiceData.terms && (
            <div className="w-full border-t mt-6 pt-6 px-4 sm:px-6 md:px-8 lg:px-10">
              <div className="max-w-4xl mx-auto space-y-3 text-sm">
                <h3 className="font-semibold text-slate-800 text-base sm:text-lg">
                  Terms and Conditions
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {invoiceData.terms}
                </p>
              </div>
            </div>
          )}

          {/* === notes === */}
          {invoiceData.terms && (
            <div className="w-full border-t mt-6 pt-6 px-4 sm:px-6 md:px-8 lg:px-10">
              <div className="max-w-4xl mx-auto space-y-3 text-sm">
                <h3 className="font-semibold text-slate-800 text-base sm:text-lg">
                  Notes
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {invoiceData.Notes}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">🏛️</span>
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Bank And UPI Details
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-green-500 text-sm font-medium">
                    ✓ Enabled
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBankDetails(!showBankDetails)}
            >
              {showBankDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {showBankDetails && (
          <CardContent className="space-y-6">
            {showBankForm ? (
              <BankingDetailsForm
                initialData={bankingDetails}
                onSave={handleSaveBankDetails}
                onCancel={() => setShowBankForm(false)}
              />
            ) : (
              <>
                {qrSrc && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Payment QR</Label>
                    <img
                      src={qrSrc}
                      alt="Payment QR"
                      className="h-40 w-40 object-contain border rounded-md mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Scan to pay</p>
                  </div>
                )}

                {/* Bank Account Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded">
                      <span className="text-xl">🏛️</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Show Bank Account Details</h3>
                      <p className="text-sm text-gray-600">NEFT, IMPS, CASH</p>
                    </div>
                  </div>
                  <Switch
                    checked={showBankDetails}
                    onCheckedChange={setShowBankDetails}
                  />
                </div>

                {/* Bank Account Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Bank Account</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600"
                      onClick={() => setShowBankForm(true)}
                    >
                      ✏️ Edit
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                    <h4 className="font-semibold text-lg">
                      {bankingDetails.bankName}
                    </h4>
                    <p className="text-gray-700 font-medium">
                      {bankingDetails.accountHolderName}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Account No:</span>{" "}
                        {bankingDetails.accountNumber}
                      </div>
                      <div>
                        <span className="font-medium">IFSC:</span>{" "}
                        {bankingDetails.ifsc}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 h-12"
                    onClick={() => setShowBankForm(true)}
                  >
                    Select Another Bank Account
                  </Button>
                </div>

                {/* UPI Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded">
                      <span className="text-xl">📱</span>
                    </div>
                    <div>
                      <h3 className="font-medium">UPI Details</h3>
                      <p className="text-sm text-gray-600">
                        Collect payments via UPI apps like Google Pay, PhonePe,
                        PayTM.
                      </p>
                    </div>
                  </div>
                  {bankingDetails.upiIds[0] ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{bankingDetails.upiIds[0]}</p>
                    </div>
                  ) : (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                      onClick={() => setShowBankForm(true)}
                    >
                      ➕ Add UPI ID
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* --- Final Actions --- */}
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Final Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handlePrint}
              className="h-14 bg-gray-600 hover:bg-gray-700 text-white font-medium"
            >
              <Printer className="mr-2 h-5 w-5" /> Print Invoice
            </Button>
            <Button
              onClick={() => downloadPDF(invoiceData, setLoading, toast)}
              className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              <Download className="mr-2 h-5 w-5" /> Download as PDF
            </Button>

            <Button
              onClick={handleSendEmail}
              className="h-14 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              <Mail className="mr-2 h-5 w-5" /> Send via Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BankingDetailsForm = ({ initialData = {}, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
    accountType: "",
    upiIds: [""],
    ...initialData,
  });

  // Handle regular input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle UPI field changes
  const handleUpiChange = (index, value) => {
    const newUpiIds = [...formData.upiIds];
    newUpiIds[index] = value;
    setFormData((prev) => ({ ...prev, upiIds: newUpiIds }));
  };

  const addUpiField = () => {
    setFormData((prev) => ({ ...prev, upiIds: [...prev.upiIds, ""] }));
  };

  const removeUpiField = (index) => {
    const updated = [...formData.upiIds];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, upiIds: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* === Bank Fields === */}
      <div>
        <Label htmlFor="accountHolderName">Account Holder Name</Label>
        <Input
          name="accountHolderName"
          value={formData.accountHolderName}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="ifsc">IFSC Code</Label>
        <Input
          name="ifsc"
          value={formData.ifsc}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="bankName">Bank Name</Label>
        <Input
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="accountType">Account Type</Label>
        <Input
          name="accountType"
          value={formData.accountType}
          onChange={handleChange}
          placeholder="e.g., Savings, Current"
          required
        />
      </div>

      {/* === UPI IDs Section === */}
      <div className="space-y-3">
        <Label>UPI ID(s)</Label>
        {formData.upiIds.map((upi, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              type="text"
              value={upi}
              placeholder="example@upi"
              onChange={(e) => handleUpiChange(index, e.target.value)}
              className="flex-grow"
            />
            {formData.upiIds.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeUpiField(index)}
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addUpiField}
          className="text-sm"
        >
          ➕ Add UPI ID
        </Button>
      </div>

      {/* === Actions === */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 text-white">
          Save
        </Button>
      </div>
    </form>
  );
};

export default BankingPreviewStep;