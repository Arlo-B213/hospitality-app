"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/current-user";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Image,
  Monitor,
  TextT,
  Gear,
  Check,
  CloudArrowUp,
  Moon,
  Sun,
  Info,
} from "@phosphor-icons/react";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

const pulseVariants = {
  pulse: {
    boxShadow: [
      "0 0 0 0 rgba(220, 38, 38, 0.4)",
      "0 0 0 8px rgba(220, 38, 38, 0.2)",
      "0 0 0 16px rgba(220, 38, 38, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

const successVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
  },
};

const confettiVariants = {
  hidden: { y: 0, opacity: 1 },
  exit: {
    y: -100,
    opacity: 0,
    transition: { duration: 0.6 },
  },
};

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
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          logoUrl: url,
        }));
      };
      reader.readAsDataURL(files[0]);
    }
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
      setShowSuccess(true);
      setMessage({ type: "success", text: "Branding config updated successfully!" });

      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);

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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Gear size={40} className="text-red-600" weight="light" />
        </motion.div>
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
    <motion.div
      className="min-h-screen p-clamp"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-clamp">
        <h1 className="text-5xl font-bold text-neutral-100 mb-4">
          Brand Customization
        </h1>
        <p className="text-lg text-neutral-400">
          Design your application's unique identity with custom colors, logos, and themes.
        </p>
      </motion.div>

      {/* Alert Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-clamp p-6 rounded-xl border-l-4 backdrop-blur ${
              message.type === "success"
                ? "bg-emerald-900/30 border-emerald-600 text-emerald-200"
                : "bg-red-900/30 border-red-600 text-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <Check weight="bold" size={24} />
              ) : (
                <Info weight="bold" size={24} />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-clamp">
        {/* Form Section */}
        <motion.div variants={itemVariants} className="space-y-clamp">
          {/* App Name Section */}
          <FormSection
            icon={Gear}
            title="General Settings"
            description="Configure your application's basic branding"
          >
            <div className="space-y-6">
              <FormInput
                label="Application Name"
                name="appName"
                type="text"
                value={formData.appName || ""}
                onChange={handleInputChange}
                placeholder="The Service Stack"
                icon={TextT}
              />
            </div>
          </FormSection>

          {/* Color Section */}
          <FormSection
            icon={Palette}
            title="Color Palette"
            description="Choose colors that represent your brand"
          >
            <div className="space-y-6">
              <ColorPicker
                label="Primary Color"
                name="primaryColor"
                value={formData.primaryColor || "#3b82f6"}
                onChange={handleInputChange}
              />
              <ColorPicker
                label="Secondary Color"
                name="secondaryColor"
                value={formData.secondaryColor || "#1e293b"}
                onChange={handleInputChange}
              />
              <ColorPicker
                label="Accent Color"
                name="accentColor"
                value={formData.accentColor || "#dc2626"}
                onChange={handleInputChange}
              />
            </div>
          </FormSection>

          {/* Logo Section */}
          <FormSection
            icon={Image}
            title="Logo & Branding"
            description="Upload your company logo"
          >
            <LogoUpload
              value={formData.logoUrl}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, logoUrl: url }))
              }
              onDrag={handleDrag}
              onDrop={handleDrop}
              dragActive={dragActive}
            />
          </FormSection>

          {/* Theme & Typography Section */}
          <FormSection
            icon={Monitor}
            title="Theme & Typography"
            description="Set default appearance preferences"
          >
            <div className="space-y-6">
              <ThemeToggle
                value={formData.theme || "dark"}
                onChange={(theme) =>
                  setFormData((prev) => ({ ...prev, theme }))
                }
              />
              <FontSelector
                value={formData.fontFamily || "geist-sans"}
                onChange={(font) =>
                  setFormData((prev) => ({ ...prev, fontFamily: font }))
                }
              />
            </div>
          </FormSection>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex gap-4 pt-6 border-t border-neutral-700"
          >
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-neutral-600 disabled:to-neutral-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                variants={pulseVariants}
                animate={!saving ? "pulse" : ""}
              />
              <motion.div
                animate={{ x: saving ? 10 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {saving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block"
                    >
                      <CloudArrowUp weight="bold" size={20} />
                    </motion.div>
                  </>
                ) : (
                  <>
                    <Check weight="bold" size={20} />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.div>
            </motion.button>

            <motion.button
              onClick={() => setFormData(config || {})}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-700 text-neutral-200 rounded-xl font-semibold transition-all"
            >
              Reset
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Live Preview Section */}
        <motion.div variants={itemVariants} className="sticky top-8">
          <LivePreview formData={formData} />
        </motion.div>
      </div>

      {/* Success Celebration */}
      <AnimatePresence>
        {showSuccess && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                variants={confettiVariants}
                initial="hidden"
                exit="exit"
                className="fixed pointer-events-none"
                style={{
                  left: `${20 + i * 10}%`,
                  top: "50%",
                }}
              >
                <motion.div
                  animate={{ rotate: 360, scale: [1, 0] }}
                  transition={{ duration: 0.8 }}
                >
                  <Check
                    size={32}
                    weight="bold"
                    className="text-emerald-400"
                  />
                </motion.div>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Color Picker Component
function ColorPicker({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <label className="block text-sm font-semibold text-neutral-200">
        {label}
      </label>
      <div className="flex gap-4 items-center">
        <motion.div
          className="relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            name={name}
            value={value}
            onChange={onChange}
            className="relative w-20 h-20 rounded-xl cursor-pointer border-2 border-neutral-700 hover:border-neutral-600 transition-colors"
          />
        </motion.div>
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-red-600 rounded-lg text-neutral-100 font-mono text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-600/30"
          placeholder="#000000"
        />
      </div>
    </motion.div>
  );
}

// Form Section Component
function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: any;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 rounded-xl p-6 lg:p-8 backdrop-blur transition-all group hover:shadow-lg hover:shadow-red-600/10"
    >
      <div className="flex items-start gap-4 mb-6">
        <motion.div
          className="p-3 bg-red-600/10 rounded-lg group-hover:bg-red-600/20 transition-colors"
          whileHover={{ rotate: 10 }}
        >
          <Icon size={24} weight="bold" className="text-red-600" />
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-neutral-100">{title}</h3>
          <p className="text-sm text-neutral-400 mt-1">{description}</p>
        </div>
      </div>
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Form Input Component
function FormInput({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: any;
}) {
  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <label className="block text-sm font-semibold text-neutral-200">
        {label}
      </label>
      <div className="relative group">
        <motion.input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          whileFocus={{ scale: 1.01 }}
          className="w-full px-6 py-4 bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-600 focus:border-red-600 rounded-lg text-neutral-100 focus:outline-none transition-all focus:ring-2 focus:ring-red-600/30"
        />
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 pointer-events-none"
          animate={{ x: [-100, 100] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

// Logo Upload Component
function LogoUpload({
  value,
  onChange,
  onDrag,
  onDrop,
  dragActive,
}: {
  value?: string;
  onChange: (url: string) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  dragActive: boolean;
}) {
  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <motion.div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        animate={{
          backgroundColor: dragActive ? "rgba(220, 38, 38, 0.1)" : "transparent",
          borderColor: dragActive ? "rgb(220, 38, 38)" : "rgb(31, 41, 55)",
        }}
        className="relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group hover:border-red-600/50 hover:bg-red-600/5"
      >
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="mb-4"
        >
          <CloudArrowUp size={40} weight="bold" className="text-red-600 mx-auto" />
        </motion.div>
        <p className="text-neutral-200 font-semibold mb-1">
          Drop your logo here or click to upload
        </p>
        <p className="text-sm text-neutral-400">PNG, JPG up to 5MB</p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                onChange(event.target?.result as string);
              };
              reader.readAsDataURL(file);
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </motion.div>

      {value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-lg overflow-hidden bg-neutral-800 p-4 border border-neutral-700"
        >
          <motion.img
            src={value}
            alt="Logo preview"
            className="max-h-32 mx-auto"
            whileHover={{ scale: 1.05 }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

// Theme Toggle Component
function ThemeToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (theme: string) => void;
}) {
  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <label className="block text-sm font-semibold text-neutral-200">
        Default Theme
      </label>
      <div className="flex gap-4">
        {[
          { value: "dark", label: "Dark", icon: Moon },
          { value: "light", label: "Light", icon: Sun },
        ].map((theme) => {
          const Icon = theme.icon;
          return (
            <motion.button
              key={theme.value}
              onClick={() => onChange(theme.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-lg font-semibold transition-all border-2 ${
                value === theme.value
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600"
              }`}
            >
              <Icon size={20} weight="bold" />
              {theme.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Font Selector Component
function FontSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (font: string) => void;
}) {
  const fonts = [
    { value: "geist-sans", label: "Geist Sans", preview: "Modern & Clean" },
    { value: "system-ui", label: "System UI", preview: "Native & Fast" },
    { value: "serif", label: "Serif", preview: "Classic & Elegant" },
  ];

  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <label className="block text-sm font-semibold text-neutral-200">
        Font Family
      </label>
      <motion.select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        whileFocus={{ scale: 1.01 }}
        className="w-full px-4 py-3 bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-600 focus:border-red-600 rounded-lg text-neutral-100 focus:outline-none transition-all focus:ring-2 focus:ring-red-600/30 font-semibold"
      >
        {fonts.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label} — {font.preview}
          </option>
        ))}
      </motion.select>
    </motion.div>
  );
}

// Live Preview Component
function LivePreview({ formData }: { formData: Partial<BrandingConfig> }) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl overflow-hidden backdrop-blur sticky top-8"
    >
      {/* Preview Header */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 border-b border-neutral-700 p-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center"
          >
            <Palette size={24} weight="bold" className="text-red-600" />
          </motion.div>
          <div>
            <p className="text-sm text-neutral-400">Live Preview</p>
            <h3 className="text-lg font-bold text-neutral-100">Brand Preview</h3>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <motion.div
        className="p-8 space-y-6"
        animate={{ backgroundColor: formData.secondaryColor || "#1e293b" }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo Preview */}
        {formData.logoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <motion.img
              src={formData.logoUrl}
              alt="Logo"
              className="h-16 object-contain drop-shadow-lg"
              whileHover={{ scale: 1.1 }}
            />
          </motion.div>
        )}

        {/* App Name */}
        <motion.div
          animate={{ color: formData.primaryColor || "#3b82f6" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold mb-2">
            {formData.appName || "The Service Stack"}
          </h2>
          <motion.div
            className="h-1 w-16 bg-red-600 mx-auto rounded-full"
            layoutId="underline"
          />
        </motion.div>

        {/* Description */}
        <p
          className="text-center text-neutral-300 text-sm"
          style={{
            opacity: 0.8,
            color: formData.primaryColor ? "inherit" : "#d1d5db",
          }}
        >
          Your brand brings your vision to life
        </p>

        {/* Color Swatches */}
        <div className="grid grid-cols-3 gap-4 pt-6">
          {[
            { label: "Primary", value: formData.primaryColor || "#3b82f6" },
            {
              label: "Secondary",
              value: formData.secondaryColor || "#1e293b",
            },
            { label: "Accent", value: formData.accentColor || "#dc2626" },
          ].map((color) => (
            <motion.div key={color.label} className="text-center">
              <motion.div
                className="w-full h-16 rounded-lg mb-2 border-2 border-neutral-700"
                animate={{ backgroundColor: color.value }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.08, borderColor: "rgb(229, 231, 235)" }}
              />
              <p className="text-xs text-neutral-400 font-mono">{color.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Button Previews */}
        <div className="flex flex-col gap-3 pt-6">
          <motion.button
            animate={{ backgroundColor: formData.primaryColor || "#3b82f6" }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-6 py-3 text-white font-semibold rounded-lg"
          >
            Primary Button
          </motion.button>
          <motion.button
            animate={{ backgroundColor: formData.accentColor || "#dc2626" }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-6 py-3 text-white font-semibold rounded-lg"
          >
            Accent Button
          </motion.button>
        </div>

        {/* Theme Indicator */}
        <motion.div
          className="pt-6 border-t border-white/10 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {formData.theme === "dark" ? (
            <>
              <Moon size={16} weight="bold" className="text-neutral-400" />
              <span className="text-xs text-neutral-400 font-medium">
                Dark Theme
              </span>
            </>
          ) : (
            <>
              <Sun size={16} weight="bold" className="text-neutral-400" />
              <span className="text-xs text-neutral-400 font-medium">
                Light Theme
              </span>
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
