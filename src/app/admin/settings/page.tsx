'use client'
import React, { useState } from "react";

const SettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    // Clear authentication tokens or cookies here
    localStorage.removeItem("isAdminAuthenticated");
    // Redirect to login page or homepage
    window.location.href = "/admin/login";
  };

  const handleSaveSettings = () => {
    // Placeholder for saving settings logic
    alert("Settings saved (functionality to be implemented)");
  };

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white p-8 font-sans shadow-lg z-50 overflow-auto">
      <button
        onClick={onClose}
        className="mb-6 text-gray-600 hover:text-gray-900 font-bold"
      >
        Close &times;
      </button>
      <h1 className="text-3xl font-semibold text-blue-600 mb-6">Settings</h1>

      <section className="mb-6">
        <h2 className="text-xl font-medium text-black mb-4">Profile Information</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-1" htmlFor="adminName">
            Name
          </label>
          <input
            id="adminName"
            type="text"
            placeholder="Admin Name"
            className="w-full border border-gray-300 rounded px-3 py-2"
            disabled
            value="Aam Agar"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="adminRole">
            Role
          </label>
          <input
            id="adminRole"
            type="text"
            placeholder="Admin Role"
            className="w-full border border-gray-300 rounded px-3 py-2"
            disabled
            value="Warden"
          />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium text-black mb-4">Change Password</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-1" htmlFor="currentPassword">
            Current Password
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter current password"
            />
            <button
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="py-2 px-4 bg-gray-100 rounded hover:bg-gray-200"
            >
              {showCurrentPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="newPassword">
            New Password
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter new password"
            />
            <button
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="py-2 px-4 bg-gray-100 rounded hover:bg-gray-200"
            >
              {showNewPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium text-black mb-4">Preferences</h2>
        <div className="flex items-center mb-4">
          <input
            id="emailNotifications"
            type="checkbox"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
            className="mr-2"
          />
          <label htmlFor="emailNotifications" className="select-none">
            Email Notifications
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="darkMode"
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="mr-2"
          />
          <label htmlFor="darkMode" className="select-none">
            Dark Mode
          </label>
        </div>
      </section>

      <div className="flex justify-between items-center">
        <button
          onClick={handleSaveSettings}
          className="py-3 px-6 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700"
        >
          Save Settings
        </button>
        <button
          onClick={handleLogout}
          className="py-3 px-6 rounded-full bg-red-500 text-white font-semibold shadow-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
