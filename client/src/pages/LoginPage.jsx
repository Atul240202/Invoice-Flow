import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-12">
      <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-800">
          {isRegistering ? "Create an Account" : "Welcome Back"}
        </h2>

        {/* Form Switch */}
        {isRegistering ? (
          <>
            <RegisterForm />
            <p className="mt-6 text-sm text-center text-gray-600">
              Already have an account?{" "}
              <button
                className="text-indigo-600 hover:underline font-semibold"
                onClick={() => setIsRegistering(false)}
              >
                Log In
              </button>
            </p>
          </>
        ) : (
          <>
            <LoginForm />
            <div className="my-6 flex items-center justify-center relative">
              <span className="absolute bg-white px-4 text-gray-400 text-sm">OR</span>
              <div className="w-full h-px bg-gray-200" />
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await fetch("http://localhost:5000/api/auth/google-login", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ credential: credentialResponse.credential }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                      localStorage.setItem("token", data.token);
                      navigate("/dashboard");
                    } else {
                      console.error("Google login failed:", data.message);
                      alert(data.message);
                    }
                  } catch (err) {
                    console.error("Google login error:", err);
                    alert("Google login failed");
                  }
                }}
                onError={() => {
                  console.log("Google Login Failed");
                  alert("Google Login Failed");
                }}
              />
            </div>

            <p className="mt-6 text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <button
                className="text-indigo-600 hover:underline font-semibold"
                onClick={() => setIsRegistering(true)}
              >
                Register
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
