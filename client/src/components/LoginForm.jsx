import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // loader state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // start loader

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        form
      );
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false); //  stop loader
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
        <a href="/forgot-password" className="text-blue-500 hover:underline">
          Forgot Password?
        </a>
      </p>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`${
          loading ? "opacity-70 cursor-not-allowed" : ""
        } bg-gradient-to-r from-blue-500 to-cyan-400 hover:bg-purple-700 text-white py-2 rounded-xl font-medium flex justify-center items-center`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 100 16v-4l-3.5 3.5L12 24v-4a8 8 0 01-8-8z"
              ></path>
            </svg>
            Logging in...
          </span>
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
}
