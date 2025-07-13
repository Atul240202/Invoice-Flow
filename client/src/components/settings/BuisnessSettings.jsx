import React, { useState, useEffect } from "react";
import axios from "axios";

export default function BusinessSettings() {
  const [form, setForm] = useState({
    businessName: "",
    gstin: "",
    pan: "",
    businessType: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/settings/business", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({
        businessName: res.data.businessName || "",
        gstin: res.data.gstin || "",
        pan: res.data.pan || "",
        businessType: res.data.businessType || "",
        address: res.data.address || "",
      });
      } catch (err) {
        console.error("Failed to fetch business info:", err);
      }
    };

    fetchBusinessInfo();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateFields = () => {
    const newErrors = {};
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (form.pan && !panRegex.test(form.pan.toUpperCase())) {
      newErrors.pan = "Invalid PAN format (e.g. ABCDE1234F)";
    }

    if (form.gstin && !gstRegex.test(form.gstin.toUpperCase())) {
      newErrors.gstin = "Invalid GSTIN format (15 characters)";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(
        "http://localhost:5000/api/settings/business",
        {
          businessName: form.businessName,
          gstin: form.gstin,
          pan: form.pan,
          businessType: form.businessType,
          address: form.address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Business information updated successfully!");
      console.log("Updated data:", res.data);
    } catch (error) {
      console.error("Business update error:", error.response?.data?.message || error.message);
      alert("Failed to update business info.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-blue-500 mb-2">Business Settings</h2>
      <p className="text-gray-600 mb-6">Manage your company’s legal and contact details.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">Business Name</label>
          <input
            name="businessName"
            placeholder="Business Name"
            className="input"
            value={form.businessName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">GSTIN</label>
          <input
            name="gstin"
            placeholder="GSTIN"
            className="input"
            value={form.gstin}
            onChange={handleChange}
          />
          {errors.gstin && <p className="text-red-500 text-sm">{errors.gstin}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">PAN</label>
          <input
            name="pan"
            placeholder="PAN"
            className="input"
            value={form.pan}
            onChange={handleChange}
          />
          {errors.pan && <p className="text-red-500 text-sm">{errors.pan}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Business Type</label>
          <select
            name="businessType"
            className="input"
            value={form.businessType}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option value="Partnership">Partnership</option>
            <option value="Private Limited">Private Limited</option>
            <option value="Public Limited">Public Limited</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Business Address</label>
          <input
            name="address"
            placeholder="Business Address"
            className="input"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-xl hover:scale-[1.01] text-white"
          }`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
