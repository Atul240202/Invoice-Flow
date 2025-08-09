import React, { useState } from "react";
import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Database,
} from "lucide-react";

import ProfileSettings from "../components/settings/ProfileSettings";
import BusinessSettings from "../components/settings/BuisnessSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import SecuritySettings from "../components/settings/SecuritySettings";

const tabs = [
  { key: "profile", label: "Profile", icon: <User className="h-4 w-4" />, component: ProfileSettings },
  { key: "business", label: "Business", icon: <Building2 className="h-4 w-4" />, component: BusinessSettings },
  { key: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" />, component: NotificationSettings },
  { key: "security", label: "Security", icon: <Shield className="h-4 w-4" />, component: SecuritySettings },
 
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component ?? ProfileSettings;

  return (
    <div className="min-h-screen p-6 bg-gray-50 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-black tracking-tight">Settings</h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                Manage your account, business, and application preferences
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 text-sm font-medium border-2 border-green-200 bg-green-50 text-green-800 rounded-full">
            All Settings Synced
          </span>
        </div>
      </div>

      {/* Tab List */}
      <div className="grid w-full grid-cols-6 h-16 bg-gray-100 p-1 rounded-xl shadow-lg">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`h-14 flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200
              ${activeTab === key
                ? "bg-white shadow-md text-blue-600"
                : "text-black hover:bg-white hover:shadow-sm"
              }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-xl shadow">
        <ActiveComponent />
      </div>
    </div>
  );
}
