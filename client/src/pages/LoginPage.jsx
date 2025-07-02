import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";



export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-4 text-white">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-black">
        {isRegistering ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>
            <RegisterForm />
            <p className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <button
                className="text-purple-600 hover:underline font-medium"
                onClick={() => setIsRegistering(false)}
              >
                Back to Login
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Welcome Back</h2>
            <LoginForm />
            <p className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <button
                className="text-purple-600 hover:underline font-medium"
                onClick={() => setIsRegistering(true)}
              >
                Register
              </button>
            </p>

             <h1 className="text-3xl font-bold mb-6">Login with Google</h1>
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
        </>
        )}
      </div>
    </div>
  );
}
