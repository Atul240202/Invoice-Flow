import React from "react";

export default function RegisterForm() {
  return (
    <form className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Full Name"
        className="border rounded-xl px-4 py-2"
      />
      <input
        type="email"
        placeholder="Email"
        className="border rounded-xl px-4 py-2"
      />
      <input
        type="password"
        placeholder="Password"
        className="border rounded-xl px-4 py-2"
      />
      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-medium"
      >
        Register
      </button>
    </form>
  );
}
