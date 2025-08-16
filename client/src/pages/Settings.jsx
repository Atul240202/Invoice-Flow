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
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-black tracking-tight">Settings</h1>
              <p className="text-sm sm:text-lg text-gray-700 leading-relaxed">
                Manage your account, business, and application preferences
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border-2 border-green-200 bg-green-50 text-green-800 rounded-full">
            All Settings Synced
          </span>
        </div>
      </div>

      {/* Tab List - Responsive Design */}
      <div className="w-full">
        {/* Mobile: Dropdown/Stack Layout */}
        <div className="block sm:hidden">
          <div className="bg-gray-100 p-1 rounded-xl shadow-lg">
            <div className="grid grid-cols-2 gap-1">
              {tabs.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`h-12 flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 text-sm
                    ${activeTab === key
                      ? "bg-white shadow-md text-blue-600"
                      : "text-black hover:bg-white hover:shadow-sm"
                    }`}
                >
                  {icon}
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tablet and Desktop: Horizontal Layout */}
        <div className="hidden sm:block">
          <div className="flex w-full bg-gray-100 p-1 rounded-xl shadow-lg overflow-x-auto">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 min-w-0 h-14 flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 whitespace-nowrap
                  ${activeTab === key
                    ? "bg-white shadow-md text-blue-600"
                    : "text-black hover:bg-white hover:shadow-sm"
                  }`}
              >
                {icon}
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
        <ActiveComponent />
      </div>
    </div>
  );
}