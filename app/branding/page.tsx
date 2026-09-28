"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/current-user";
import { useRouter } from "next/navigation";

interface BrandingConfig {
  id: string;
  appName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  theme: string;
  fontFamily: string;
}

export default function BrandingPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<BrandingConfig | null>(null);
  const [formData, setFormData] = useState<Partial<BrandingConfig>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // We need to fetch the current user to check authorization
        const response = await fetch("/api/current-user");
        const user = await response.json();

        if (!user || user.role !== "MANAGER") {
          router.push("/");
          return;
        }

        setIsAdmin(true);
        await fetchBrandingConfig();
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchBrandingConfig = async () => {
    try {
      const response = await fetch("/api/branding/config");
      const data = await response.json();
      setConfig(data);
      setFormData(data);
    } catch (error) {
      console.error("Failed to fetch branding config:", error);
      setMessage({ type: "error", text: "Failed to load branding config" });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/branding/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save branding config");
      }

      const data = await response.json();
      setConfig(data);
      setMessage({ type: "success", text: "Branding config updated successfully!" });

      // Refresh page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Failed to save branding config:", error);
      setMessage({
        type: "error",
        text: "Failed to save branding config. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-400">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-400">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-neutral-100">
          Branding & Theme Customization
        </h1>
        <p className="text-neutral-400 mt-2">
          Manage your application's branding, colors, and appearance.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-900 text-green-200"
              : "bg-red-900 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6 bg-neutral-900 p-6 rounded-lg border border-neutral-800">
        {/* App Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-200 mb-2">
            Application Name
          </label>
          <input
            type="text"
            name="appName"
            value={formData.appName || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-blue-500"
            placeholder="The Service Stack"
          />
        </div>

        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-neutral-200 mb-2">
            Primary Color
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              name="primaryColor"
              value={formData.primaryColor || "#3b82f6"}
              onChange={handleInputChange}
              className="w-20 h-10 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              name="primaryColor"
              value={formData.primaryColor || ""}
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-blue-500 font-mono text-sm"
              placeholder="#3b82f6"
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <label className="block text-sm font-medium text-neutral-200 mb-2">
            Secondary Color
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              name="secondaryColor"
              value={formData.secondaryColor || "#1e293b"}
              onChange={handleInputChange}
              className="w-20 h-10 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              name="secondaryColor"
              value={formData.secondaryColor || ""}
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-blue-500 font-mono text-sm"
              placeholder="#1e293b"
            />
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-neutral-200 mb-2">
            Accent Color
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              name="accentColor"
              value={formData.accentColor || "#f97316"}
              onChange={handleInputChange}
              className="w-20 h-10 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              name="accentColor"
              value={formData.accentColor || ""}
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-blue-500 font-mono text-sm"
              placeholder="#f97316"
            />
          </div>
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-neutral-200 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            name="logoUrl"
            value={formData.logoUrl || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-blue-500"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-neutral-200 mb-2">
            Default Theme
          </label>
          <select
            name="theme"
            value={formData.theme || "dark"}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-blue-500"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-neutral-200 mb-2">
            Font Family
          </label>
          <select
            name="fontFamily"
            value={formData.fontFamily || "geist-sans"}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-blue-500"
          >
            <option value="geist-sans">Geist Sans</option>
            <option value="system-ui">System UI</option>
            <option value="serif">Serif</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-neutral-700 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 text-white rounded-lg font-medium transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => setFormData(config || {})}
            disabled={saving}
            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-100 mb-4">Preview</h2>
        <div
          style={{
            backgroundColor: formData.secondaryColor || "#1e293b",
            color: "#fff",
          }}
          className="p-6 rounded-lg"
        >
          <div
            style={{
              color: formData.primaryColor || "#3b82f6",
            }}
            className="text-2xl font-bold mb-2"
          >
            {formData.appName || "The Service Stack"}
          </div>
          <p className="text-sm opacity-75 mb-4">
            Your application will use these colors and settings.
          </p>
          <div className="flex gap-4">
            <button
              style={{
                backgroundColor: formData.primaryColor || "#3b82f6",
              }}
              className="px-4 py-2 rounded text-white text-sm font-medium"
            >
              Primary Button
            </button>
            <button
              style={{
                backgroundColor: formData.accentColor || "#f97316",
              }}
              className="px-4 py-2 rounded text-white text-sm font-medium"
            >
              Accent Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
