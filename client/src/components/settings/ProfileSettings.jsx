import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProfileSettings() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/settings/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setForm(res.data);
      } catch (err) {
        setMessage("Failed to load profile.");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost:5000/api/settings/profile", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Profile updated successfully!");
      setForm(res.data); 
    } catch (err) {
      setMessage("Profile update failed.");
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <input
        name="fullName"
        placeholder="Full Name"
        className="border px-4 py-2 rounded-xl"
        value={form.fullName}
        onChange={handleChange}
      />
      <input
        name="email"
        placeholder="Email"
        type="email"
        className="border px-4 py-2 rounded-xl"
        value={form.email}
        onChange={handleChange}
        disabled 
      />
      <input
        name="phone"
        placeholder="Phone"
        className="border px-4 py-2 rounded-xl"
        value={form.phone}
        onChange={handleChange}
      />
      <input
        name="address"
        placeholder="Address"
        className="border px-4 py-2 rounded-xl"
        value={form.address}
        onChange={handleChange}
      />
      <button className="bg-purple-600 text-white py-2 rounded-xl">
        Save
      </button>
      {message && <p className="text-sm text-center mt-2 text-indigo-700">{message}</p>}
    </form>
  );
}
