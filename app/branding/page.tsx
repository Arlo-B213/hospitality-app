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
  ArrowRight,
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

// Premium animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 25, duration: 0.5 },
  },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const pulseVariants = {
  pulse: {
    boxShadow: [
      "0 0 0 0 rgba(220, 38, 38, 0.3)",
      "0 0 0 12px rgba(220, 38, 38, 0.1)",
      "0 0 0 24px rgba(220, 38, 38, 0)",
    ],
    transition: {
      duration: 5,
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
      stiffness: 120,
      damping: 20,
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
    y: -120,
    opacity: 0,
    transition: { duration: 1.5 },
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        >
          <Gear size={48} className="text-red-600" weight="regular" />
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <p className="text-red-600 text-lg font-semibold">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Luxury Header */}
      <motion.div
        className="border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/80"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-8 py-6 sm:px-12 lg:px-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-800 text-gray-900 tracking-tight">
                Brand Customization
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base font-medium">
                Define your luxury hospitality brand identity
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="hidden sm:flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-red-50 to-red-100"
            >
              <Palette size={28} className="text-red-600" weight="duotone" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Alert Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md"
          >
            <motion.div
              className={`px-6 py-4 rounded-2xl backdrop-blur-lg border ${
                message.type === "success"
                  ? "bg-emerald-50/90 border-emerald-200 text-emerald-900 shadow-lg shadow-emerald-500/10"
                  : "bg-red-50/90 border-red-200 text-red-900 shadow-lg shadow-red-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                {message.type === "success" ? (
                  <Check weight="bold" size={20} />
                ) : (
                  <Info weight="bold" size={20} />
                )}
                <span className="font-semibold text-sm">{message.text}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content: Split-Screen Layout */}
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-8 lg:py-12">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Form Section: 40% on desktop */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <FormSection
              icon={Gear}
              title="General Settings"
              description="Configure basic branding"
            >
              <div className="space-y-5">
                <FormInput
                  label="Application Name"
                  name="appName"
                  type="text"
                  value={formData.appName || ""}
                  onChange={handleInputChange}
                  placeholder="Your Luxury Brand"
                />
              </div>
            </FormSection>

            {/* Color Palette */}
            <FormSection
              icon={Palette}
              title="Color Palette"
              description="Define your brand colors"
            >
              <div className="space-y-5">
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

            {/* Logo & Branding */}
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

            {/* Theme & Typography */}
            <FormSection
              icon={Monitor}
              title="Theme & Typography"
              description="Set appearance preferences"
            >
              <div className="space-y-5">
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
              className="flex gap-3 pt-6 mt-8 border-t border-gray-200"
            >
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 relative px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 group overflow-hidden shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
              >
                <motion.div
                  className="absolute inset-0 bg-white/15"
                  variants={pulseVariants}
                  animate={!saving ? "pulse" : ""}
                />
                <motion.div
                  animate={{ x: saving ? 8 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="inline-block"
                      >
                        <CloudArrowUp weight="bold" size={18} />
                      </motion.div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check weight="bold" size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </motion.div>
              </motion.button>

              <motion.button
                onClick={() => setFormData(config || {})}
                disabled={saving}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 rounded-2xl font-semibold text-sm tracking-wide transition-all shadow-sm hover:shadow-md"
              >
                Reset
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Live Preview Section: 60% on desktop - Sticky */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-3 lg:sticky lg:top-24"
          >
            <LivePreview formData={formData} />
          </motion.div>
        </motion.div>
      </div>

      {/* Success Celebration - Luxury Confetti */}
      <AnimatePresence>
        {showSuccess && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                variants={confettiVariants}
                initial="hidden"
                exit="exit"
                className="fixed pointer-events-none"
                style={{
                  left: `${15 + i * 7}%`,
                  top: "40%",
                }}
              >
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 0],
                    opacity: [1, 0],
                  }}
                  transition={{ duration: 1.5 }}
                >
                  <Check
                    size={28}
                    weight="bold"
                    className="text-red-600 drop-shadow-lg"
                  />
                </motion.div>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Premium Color Picker Component
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
      <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest">
        {label}
      </label>
      <div className="flex gap-6 items-start">
        {/* Large Luxury Color Swatch */}
        <motion.div
          className="relative group"
          whileHover="hover"
          initial="normal"
        >
          {/* Animated Glow Background */}
          <motion.div
            className="absolute -inset-3 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"
            style={{ backgroundColor: value }}
          />

          {/* Color Input (hidden but functional) */}
          <input
            type="color"
            name={name}
            value={value}
            onChange={onChange}
            className="absolute w-full h-full opacity-0 cursor-pointer rounded-2xl"
          />

          {/* Visual Swatch */}
          <motion.div
            className="relative w-32 h-32 rounded-2xl border-2 border-gray-200 cursor-pointer shadow-lg overflow-hidden"
            style={{ backgroundColor: value }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Shine Effect on Hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* Input Field & Color Code */}
        <div className="flex-1 space-y-2 pt-2">
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-red-600 text-gray-900 font-mono text-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:ring-offset-2 shadow-sm"
            placeholder="#000000"
          />
          <p className="text-xs text-gray-500 font-medium">
            Hex Code
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Premium Form Section Component
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
      className="relative bg-white/60 backdrop-blur-lg border border-gray-200 hover:border-gray-300 rounded-3xl p-8 transition-all group hover:shadow-xl hover:shadow-gray-400/10"
    >
      {/* Premium Border Gradient on Hover */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-600/0 via-red-600/0 to-red-600/0 opacity-0 group-hover:opacity-5 pointer-events-none"
      />

      <div className="relative z-10 flex items-start gap-4 mb-6">
        <motion.div
          className="p-3.5 bg-gradient-to-br from-red-100 to-red-50 rounded-xl group-hover:from-red-200 group-hover:to-red-100 transition-colors"
          whileHover={{ rotate: 12, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
        >
          <Icon size={24} weight="duotone" className="text-red-600" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg font-800 text-gray-900 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            {description}
          </p>
        </div>
      </div>
      <motion.div
        className="relative z-10 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Premium Form Input Component
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
      <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative group">
        <motion.input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          whileFocus={{ scale: 1.01, y: -1 }}
          className="w-full px-5 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-red-600 text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none transition-all focus:ring-2 focus:ring-red-600/20 focus:ring-offset-2 shadow-sm font-medium"
        />
        {/* Focus Line Animation */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-600/0 via-red-600 to-red-600/0 pointer-events-none"
          initial={{ width: "0%" }}
          whileFocus={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

// Premium Logo Upload Component
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
    <motion.div variants={itemVariants} className="space-y-5">
      <motion.div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        animate={{
          backgroundColor: dragActive ? "rgba(220, 38, 38, 0.08)" : "transparent",
          borderColor: dragActive ? "rgb(220, 38, 38)" : "rgb(229, 231, 235)",
        }}
        className="relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group hover:border-red-500/60 hover:bg-red-50/30"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-6"
        >
          <CloudArrowUp
            size={48}
            weight="duotone"
            className="text-red-600 mx-auto"
          />
        </motion.div>

        <p className="text-gray-900 font-bold text-base mb-2">
          Drop your logo here
        </p>
        <p className="text-sm text-gray-600 font-medium">
          PNG, JPG up to 5MB • Or click to browse
        </p>

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

      {/* Logo Preview */}
      {value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden bg-white p-6 border border-gray-200 shadow-sm"
        >
          <motion.img
            src={value}
            alt="Logo preview"
            className="max-h-40 mx-auto object-contain"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

// Premium Theme Toggle Component
function ThemeToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (theme: string) => void;
}) {
  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest">
        Default Theme
      </label>
      <div className="flex gap-4">
        {[
          { value: "dark", label: "Dark", icon: Moon },
          { value: "light", label: "Light", icon: Sun },
        ].map((theme) => {
          const Icon = theme.icon;
          const isSelected = value === theme.value;
          return (
            <motion.button
              key={theme.value}
              onClick={() => onChange(theme.value)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all border-2 ${
                isSelected
                  ? "bg-gradient-to-br from-red-600 to-red-700 border-red-600 text-white shadow-lg shadow-red-600/30"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <motion.div
                animate={{ rotate: isSelected ? [0, 10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Icon size={20} weight="duotone" />
              </motion.div>
              {theme.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Premium Font Selector Component
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
      <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest">
        Font Family
      </label>
      <motion.select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        whileFocus={{ scale: 1.01, y: -1 }}
        className="w-full px-5 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-red-600 text-gray-900 rounded-xl focus:outline-none transition-all focus:ring-2 focus:ring-red-600/20 focus:ring-offset-2 font-bold text-sm shadow-sm appearance-none bg-no-repeat pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundPosition: "right 1rem center",
          paddingRight: "2.75rem",
        }}
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

// Luxury Live Preview Component
function LivePreview({ formData }: { formData: Partial<BrandingConfig> }) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-3xl shadow-2xl"
    >
      {/* Premium Outer Frame */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden backdrop-blur-xl">
        {/* Preview Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center"
              >
                <Palette size={24} weight="duotone" className="text-red-600" />
              </motion.div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Live Preview
                </p>
                <h3 className="text-lg font-bold text-gray-900">
                  Your Branded App
                </h3>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-green-600"
            >
              <Check size={20} weight="bold" />
            </motion.div>
          </div>
        </div>

        {/* Premium Preview Content */}
        <motion.div
          className="p-10 space-y-8 min-h-96"
          animate={{ backgroundColor: formData.secondaryColor || "#1e293b" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Logo Section */}
          {formData.logoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 25 }}
              className="flex justify-center pt-4"
            >
              <motion.div
                className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <motion.img
                  src={formData.logoUrl}
                  alt="Logo"
                  className="h-20 object-contain drop-shadow-lg"
                />
              </motion.div>
            </motion.div>
          )}

          {/* App Title & Underline */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.h2
              animate={{ color: formData.primaryColor || "#3b82f6" }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold mb-4 drop-shadow-sm"
            >
              {formData.appName || "Your Luxury Brand"}
            </motion.h2>
            <motion.div
              className="h-1.5 w-20 mx-auto rounded-full"
              animate={{ backgroundColor: formData.accentColor || "#dc2626" }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-center text-base font-medium opacity-90 drop-shadow-sm"
            animate={{ color: formData.primaryColor ? "white" : "#f3f4f6" }}
            transition={{ duration: 0.6 }}
          >
            Premium hospitality experience
          </motion.p>

          {/* Color Palette Preview */}
          <motion.div
            className="grid grid-cols-3 gap-4 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {[
              { label: "Primary", value: formData.primaryColor || "#3b82f6" },
              {
                label: "Secondary",
                value: formData.secondaryColor || "#1e293b",
              },
              { label: "Accent", value: formData.accentColor || "#dc2626" },
            ].map((color, idx) => (
              <motion.div
                key={color.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <motion.div
                  className="w-full h-20 rounded-2xl mb-3 border-2 border-white/20 shadow-xl cursor-pointer"
                  animate={{ backgroundColor: color.value }}
                  transition={{ duration: 0.6 }}
                  whileHover={{
                    scale: 1.1,
                    y: -4,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  }}
                />
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  {color.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Interactive Buttons Preview */}
          <motion.div
            className="flex flex-col gap-3 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              animate={{ backgroundColor: formData.primaryColor || "#3b82f6" }}
              transition={{ duration: 0.6 }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 20px 40px ${formData.primaryColor || "#3b82f6"}40`,
              }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-6 py-4 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              Explore Features
              <ArrowRight size={18} weight="bold" />
            </motion.button>
            <motion.button
              animate={{ backgroundColor: formData.accentColor || "#dc2626" }}
              transition={{ duration: 0.6 }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 20px 40px ${formData.accentColor || "#dc2626"}40`,
              }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-6 py-4 text-white font-bold rounded-xl shadow-lg"
            >
              Get Started
            </motion.button>
          </motion.div>

          {/* Theme Indicator */}
          <motion.div
            className="pt-6 border-t border-white/20 flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {formData.theme === "dark" ? (
              <>
                <Moon
                  size={18}
                  weight="duotone"
                  className="text-white/80"
                />
                <span className="text-sm font-bold text-white/70">Dark Theme</span>
              </>
            ) : (
              <>
                <Sun
                  size={18}
                  weight="duotone"
                  className="text-white/80"
                />
                <span className="text-sm font-bold text-white/70">Light Theme</span>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
