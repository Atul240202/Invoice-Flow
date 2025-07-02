import React, { useState } from "react";

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailUpdates: true,
    reminders: false,
    clientAlerts: true,
    systemAlerts: false,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
      <div className="flex flex-col gap-6">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="capitalize text-gray-700">
              {key.replace(/([A-Z])/g, " $1")}
            </span>
            <button
              onClick={() => handleToggle(key)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                value ? "bg-purple-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  value ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
