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
      <div className="flex flex-col gap-4">
        {Object.keys(settings).map((key) => (
          <div key={key} className="flex justify-between items-center">
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={() => handleToggle(key)}
              className="w-5 h-5"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
