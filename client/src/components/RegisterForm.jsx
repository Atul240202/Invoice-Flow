import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    agree: false,
  });

  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if(!form.agree){
      setErrors(["You must agree to the Terms & Privacy Policy"])
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", form);
       
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
       if (err.response && err.response.data?.errors) {
      console.log("Validation Errors:", err.response.data.errors);
      setErrors(err.response.data.errors.map(e => e.message));
    } else if (err.response?.data?.message) {
      setErrors([err.response.data.message]);
    } else {
      setErrors(["SignUp Failed"]);
    }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Full Name"
        className="border rounded-xl px-4 py-2"
        name="fullName"
        value={form.fullName}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        placeholder="Email"
        className="border rounded-xl px-4 py-2"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="border rounded-xl px-4 py-2"
        name="password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="Phone Number"
        className="border rounded-xl px-4 py-2"
        required
      />
      <input
        type="text"
        name="businessName"
        value={form.businessName}
        onChange={handleChange}
        placeholder="Business Name (Optional)"
        className="border rounded-xl px-4 py-2"
      />
      <div className="flex items-center">
      <input
        type="checkbox"
        name="agree"
        checked={form.agree}
        onChange={(e) => setForm({ ...form, agree: e.target.checked })}
        className="mr-2"
      />
      <label className="text-sm text-gray-600">
        I agree to the <a href="#" className="text-blue-500 underline">Terms</a> and <a href="#" className="text-blue-500 underline">Privacy Policy</a>
      </label>
      </div>
      {errors.length > 0 && (
        <div className="text-red-600 text-sm space-y-1">
          {errors.map((err, idx) => (
          <p key={idx}>{err}</p>
          ))}
         </div>
      )}
      <button
        type="submit"
        className=" bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-purple-700 text-white py-2 rounded-xl font-medium"
      >
        Register
      </button>
    </form>
  );
}
