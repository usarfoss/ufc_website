"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { loginSchema, type LoginFormData } from "@/lib/validations";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<LoginFormData> = {};
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        router.push("/dashboard");
      } else {
        setSubmitError("Invalid email or password");
      }
    } catch (err) {
      setSubmitError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Title */}
      <h1
        className="text-2xl md:text-4xl font-extrabold text-center mb-2 md:mb-4"
        style={{
          color: "#0B874F",
          textShadow: "2px 2px #00ff95",
          letterSpacing: "1px",
        }}
      >
        // LOGIN
      </h1>

      {/* Subtitle */}
      <p className="text-center text-xs md:text-sm mb-4 md:mb-6" style={{ color: "#F5A623" }}>
        "Access granted only to authorized users."
      </p>

      {/* Error Messages */}
      {submitError && (
        <div className="mb-4 p-3 border border-red-500 bg-red-500/10 text-red-400 text-sm text-center">
          {submitError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Email */}
        <div>
          <label className="block mb-1 md:mb-2 text-xs md:text-sm font-bold" style={{ color: "#0B874F" }}>
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            className={`w-full px-3 md:px-4 py-2 md:py-3 border focus:outline-none transition-all duration-200 text-sm md:text-base ${
              errors.email ? 'border-red-500' : ''
            }`}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              borderColor: errors.email ? "#EF4444" : "#0B874F",
              boxShadow: `4px 4px 0px ${errors.email ? "#EF4444" : "#0B874F"}`,
            }}
          />
          {errors.email && (
            <p className="mt-1 text-xs md:text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 md:mb-2 text-xs md:text-sm font-bold" style={{ color: "#0B874F" }}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your password"
              className={`w-full px-3 md:px-4 py-2 md:py-3 border focus:outline-none transition-all duration-200 text-sm md:text-base ${
                errors.password ? 'border-red-500' : ''
              }`}
              style={{
                backgroundColor: "#000",
                color: "#fff",
                borderColor: errors.password ? "#EF4444" : "#0B874F",
                boxShadow: `4px 4px 0px ${errors.password ? "#EF4444" : "#0B874F"}`,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1.5 md:top-2.5 right-2 md:right-3 text-xs px-1.5 md:px-2 py-0.5 md:py-1 border rounded transition-all duration-200 hover:bg-[#0B874F] hover:text-black"
              style={{
                color: "#0B874F",
                borderColor: "#0B874F",
                backgroundColor: "transparent",
              }}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs md:text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 md:py-3 mt-2 md:mt-4 font-bold border transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_#0B874F] disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          style={{
            backgroundColor: "#0B874F",
            color: "#000",
            borderColor: "#0B874F",
            boxShadow: "4px 4px 0px #0B874F",
          }}
        >
          {loading ? "LOGGING IN..." : "LOGIN →"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center justify-center my-4 md:my-6">
        <span className="w-1/3 border-b" style={{ borderColor: "#0B874F" }}></span>
        <span className="px-2 md:px-4 text-xs" style={{ color: "#F5A623" }}>OR</span>
        <span className="w-1/3 border-b" style={{ borderColor: "#0B874F" }}></span>
      </div>

      {/* Signup Link */}
      <p className="text-center text-xs md:text-sm" style={{ color: "#fff" }}>
        Don't have an account?{" "}Can't do much<br/>
        Core members only
      </p>
    </>
  );
}