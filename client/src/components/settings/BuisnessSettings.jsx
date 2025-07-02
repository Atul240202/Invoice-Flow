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
        const res = await axios.get("http://localhost:5000/api/settings/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setForm((prev) => ({
          ...prev,
          ...res.data,
          address: res.data.businessAddress || "",
        }));
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    <div>
      <h2 className="text-xl font-semibold mb-4">Business Info</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="businessName"
          placeholder="Business Name"
          className="border px-4 py-2 rounded-xl"
          value={form.businessName}
          onChange={handleChange}
        />

        <div>
          <input
            name="gstin"
            placeholder="GSTIN"
            className="border px-4 py-2 rounded-xl w-full"
            value={form.gstin}
            onChange={handleChange}
          />
          {errors.gstin && <p className="text-red-500 text-sm">{errors.gstin}</p>}
        </div>

        <div>
          <input
            name="pan"
            placeholder="PAN"
            className="border px-4 py-2 rounded-xl w-full"
            value={form.pan}
            onChange={handleChange}
          />
          {errors.pan && <p className="text-red-500 text-sm">{errors.pan}</p>}
        </div>

        <select
          name="businessType"
          className="border px-4 py-2 rounded-xl"
          value={form.businessType}
          onChange={handleChange}
        >
          <option value="">Select Business Type</option>
          <option value="Partnership">Partnership</option>
          <option value="Private Limited">Private Limited</option>
          <option value="Public Limited">Public Limited</option>
          <option value="Other">Other</option>
        </select>

        <input
          name="address"
          placeholder="Business Address"
          className="border px-4 py-2 rounded-xl"
          value={form.address}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className={`bg-purple-600 text-white py-2 rounded-xl ${loading && "opacity-60"}`}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
