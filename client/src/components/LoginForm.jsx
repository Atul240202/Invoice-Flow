import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  
  const [error, setError] = useState("");
  const navigate = useNavigate();  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
      <p className="text-right text-sm">
        <a href="/forgot-password" className="text-purple-600 hover:underline">
          Forgot Password?
        </a>
      </p>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-medium"
      >
        Login
      </button>
    </form>
  );
}
