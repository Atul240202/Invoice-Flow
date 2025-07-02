import React, { useState } from "react";
import axios from "axios";
import { MailIcon, SendIcon, Loader2Icon, CheckCircleIcon } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage(res.data.message);
      setShowPopup(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-100 via-white to-blue-100 px-4 relative">
      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <CheckCircleIcon className="mx-auto mb-4 h-10 w-10 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-800">Check your email</h3>
            <p className="text-sm text-gray-600 mt-2">
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-5 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-white shadow-xl border border-gray-100 animate-fade-in z-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 w-14 h-14 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <MailIcon className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Forgot your password?</h2>
          <p className="text-gray-600 text-sm mt-1">
            Enter your email and we’ll send you a link to reset it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 flex items-center justify-center gap-2 text-white font-semibold rounded-lg transition-all duration-200 shadow-md ${
              loading
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2Icon className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <SendIcon className="h-5 w-5" />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-purple-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
