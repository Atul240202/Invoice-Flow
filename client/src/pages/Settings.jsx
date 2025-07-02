import React, { useState } from "react";
import ProfileSettings from "../components/settings/ProfileSettings";
import BusinessSettings from "../components/settings/BuisnessSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import SecuritySettings from "../components/settings/SecuritySettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const renderTab = () => {
    switch (activeTab) {
      case "profile": return <ProfileSettings />;
      case "business": return <BusinessSettings />;
      case "notifications": return <NotificationSettings />;
      case "security": return <SecuritySettings />;
      default: return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setActiveTab("profile")} className={tabStyle(activeTab === "profile")}>Profile</button>
        <button onClick={() => setActiveTab("business")} className={tabStyle(activeTab === "business")}>Business</button>
        <button onClick={() => setActiveTab("notifications")} className={tabStyle(activeTab === "notifications")}>Notifications</button>
        <button onClick={() => setActiveTab("security")} className={tabStyle(activeTab === "security")}>Security</button>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">{renderTab()}</div>
    </div>
  );
}

const tabStyle = (isActive) =>
  `py-2 px-4 rounded-xl font-medium ${isActive ? "bg-purple-600 text-white" : "bg-white text-purple-600 border border-purple-600"}`;
