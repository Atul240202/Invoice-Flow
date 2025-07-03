import React, { useState, useEffect } from "react";

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSecurityStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setTwoFactor(data.twoFAEnabled || false);
      } catch (err) {
        console.error("Failed to fetch profile info", err);
      }
    };

    fetchSecurityStatus();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/settings/security", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password change failed");

      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleToggle2FA = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/settings/security", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ twoFactorEnabled: !twoFactor }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "2FA toggle failed");

      setTwoFactor(!twoFactor);
      setMessage(`2FA ${!twoFactor ? "enabled" : "disabled"} successfully`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Security Settings</h2>

      {message && <p className="text-sm text-red-500 mb-4">{message}</p>}

      <form onSubmit={handleChangePassword} className="flex flex-col gap-4 mb-6">
        <input
          type="password"
          placeholder="Current Password"
          className="border px-4 py-2 rounded-xl"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          className="border px-4 py-2 rounded-xl"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button className="bg-purple-600 text-white py-2 rounded-xl">
          Change Password
        </button>
      </form>

      <div className="flex justify-between items-center">
        <label htmlFor="2fa">Enable Two-Factor Authentication (2FA)</label>
        <input
          id="2fa"
          type="checkbox"
          checked={twoFactor}
          onChange={handleToggle2FA}
          className="w-5 h-5"
        />
      </div>
    </div>
  );
}
