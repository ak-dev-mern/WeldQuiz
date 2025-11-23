import React, { useState } from "react";
import {
  Save,
  Settings,
  Shield,
  Bell,
  Globe,
  Database,
  Users,
} from "lucide-react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "LearnAI",
    siteDescription: "AI-Powered Learning Platform",
    supportEmail: "support@learnai.com",
    defaultLanguage: "en",

    // Security Settings
    requireEmailVerification: true,
    enableTwoFactorAuth: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    systemAlerts: true,

    // System Settings
    maintenanceMode: false,
    userRegistration: true,
    maxFileSize: 10,
    backupFrequency: "daily",
  });

  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSaving(false);
    // Show success message
    alert("Settings saved successfully!");
  };

  const tabs = [
    { id: "general", label: "General", icon: <Globe className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
    },
    { id: "system", label: "System", icon: <Database className="h-4 w-4" /> },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Name
        </label>
        <input
          type="text"
          value={settings.siteName}
          onChange={(e) =>
            handleInputChange("general", "siteName", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) =>
            handleInputChange("general", "siteDescription", e.target.value)
          }
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Support Email
        </label>
        <input
          type="email"
          value={settings.supportEmail}
          onChange={(e) =>
            handleInputChange("general", "supportEmail", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Language
        </label>
        <select
          value={settings.defaultLanguage}
          onChange={(e) =>
            handleInputChange("general", "defaultLanguage", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Require Email Verification
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Users must verify their email before accessing the platform
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.requireEmailVerification}
          onChange={(e) =>
            handleInputChange(
              "security",
              "requireEmailVerification",
              e.target.checked
            )
          }
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Enable Two-Factor Authentication
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add an extra layer of security for user accounts
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.enableTwoFactorAuth}
          onChange={(e) =>
            handleInputChange(
              "security",
              "enableTwoFactorAuth",
              e.target.checked
            )
          }
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) =>
            handleInputChange(
              "security",
              "sessionTimeout",
              parseInt(e.target.value)
            )
          }
          min="5"
          max="240"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Maximum Login Attempts
        </label>
        <input
          type="number"
          value={settings.maxLoginAttempts}
          onChange={(e) =>
            handleInputChange(
              "security",
              "maxLoginAttempts",
              parseInt(e.target.value)
            )
          }
          min="1"
          max="10"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Notifications
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Send email notifications to users
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.emailNotifications}
          onChange={(e) =>
            handleInputChange(
              "notifications",
              "emailNotifications",
              e.target.checked
            )
          }
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Push Notifications
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enable browser push notifications
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.pushNotifications}
          onChange={(e) =>
            handleInputChange(
              "notifications",
              "pushNotifications",
              e.target.checked
            )
          }
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course Updates
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Notify users about course updates and new content
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.courseUpdates}
          onChange={(e) =>
            handleInputChange(
              "notifications",
              "courseUpdates",
              e.target.checked
            )
          }
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            System Alerts
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Send system maintenance and alert notifications
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.systemAlerts}
          onChange={(e) =>
            handleInputChange("notifications", "systemAlerts", e.target.checked)
          }
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Maintenance Mode
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Put the site in maintenance mode (only admins can access)
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.maintenanceMode}
          onChange={(e) =>
            handleInputChange("system", "maintenanceMode", e.target.checked)
          }
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            User Registration
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Allow new users to register on the platform
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.userRegistration}
          onChange={(e) =>
            handleInputChange("system", "userRegistration", e.target.checked)
          }
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Maximum File Upload Size (MB)
        </label>
        <input
          type="number"
          value={settings.maxFileSize}
          onChange={(e) =>
            handleInputChange("system", "maxFileSize", parseInt(e.target.value))
          }
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Backup Frequency
        </label>
        <select
          value={settings.backupFrequency}
          onChange={(e) =>
            handleInputChange("system", "backupFrequency", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
    </div>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              User Management
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                User management features including bulk actions, role
                management, and user import/export are available in the main
                Users section.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          User Role Settings
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Configure default user roles, permissions, and access levels. These
          settings affect how different user types interact with the platform.
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "security":
        return renderSecuritySettings();
      case "notifications":
        return renderNotificationSettings();
      case "system":
        return renderSystemSettings();
      case "users":
        return renderUserSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage platform settings and configurations
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
        {renderTabContent()}
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          Danger Zone
        </h3>
        <p className="text-red-700 dark:text-red-300 text-sm mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <div className="space-y-3">
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium">
            Clear All Cache
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium ml-3">
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
