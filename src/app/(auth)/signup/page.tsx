"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { signupSchema, type SignupFormData } from "@/lib/validations";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    githubUsername: ""
  });
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<SignupFormData> = {};
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          fieldErrors[err.path[0] as keyof SignupFormData] = err.message;
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
      const success = await signup(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.githubUsername
      );
      if (success) {
        router.push("/dashboard");
      } else {
        setSubmitError("Signup failed. Please try again.");
      }
    } catch (err) {
      setSubmitError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Title */}
      <h1
        className="text-4xl font-extrabold text-center mb-4"
        style={{
          color: "#0B874F",
          textShadow: "2px 2px #00ff95",
          letterSpacing: "1px",
        }}
      >
        // SIGNUP
      </h1>

      {/* Subtitle */}
      <p className="text-center text-sm mb-6" style={{ color: "#F5A623" }}>
        "Join the community of developers."
      </p>

      {/* Error Messages */}
      {submitError && (
        <div className="mb-4 p-3 border border-red-500 bg-red-500/10 text-red-400 text-sm text-center">
          {submitError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block mb-2 text-sm font-bold" style={{ color: "#0B874F" }}>
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 border focus:outline-none transition-all duration-200 ${
              errors.name ? 'border-red-500' : ''
            }`}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              borderColor: errors.name ? "#EF4444" : "#0B874F",
              boxShadow: `4px 4px 0px ${errors.name ? "#EF4444" : "#0B874F"}`,
            }}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block mb-2 text-sm font-bold" style={{ color: "#0B874F" }}>
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            className={`w-full px-4 py-3 border focus:outline-none transition-all duration-200 ${
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
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* GitHub Username */}
        <div>
          <label className="block mb-2 text-sm font-bold" style={{ color: "#0B874F" }}>
            GitHub Username <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.githubUsername || ''}
            onChange={(e) => handleInputChange('githubUsername', e.target.value)}
            placeholder="Enter your GitHub username"
            className={`w-full px-4 py-3 border focus:outline-none transition-all duration-200 ${
              errors.githubUsername ? 'border-red-500' : ''
            }`}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              borderColor: errors.githubUsername ? "#EF4444" : "#0B874F",
              boxShadow: `4px 4px 0px ${errors.githubUsername ? "#EF4444" : "#0B874F"}`,
            }}
          />
          {errors.githubUsername && (
            <p className="mt-1 text-sm text-red-400">{errors.githubUsername}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block mb-2 text-sm font-bold" style={{ color: "#0B874F" }}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your password"
              className={`w-full px-4 py-3 border focus:outline-none transition-all duration-200 ${
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
              className="absolute top-2.5 right-3 text-xs px-2 py-1 border rounded transition-all duration-200 hover:bg-[#0B874F] hover:text-black"
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
            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Signup Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-4 font-bold border transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_#0B874F] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "#0B874F",
            color: "#000",
            borderColor: "#0B874F",
            boxShadow: "4px 4px 0px #0B874F",
          }}
        >
          {loading ? "CREATING ACCOUNT..." : "SIGNUP →"}
        </button>

        {/* Debug Button */}
        <button
          type="button"
          onClick={() => {
            console.log('Debug button clicked!');
            console.log('Form data:', formData);
            console.log('Auth context:', { signup });
          }}
          className="w-full py-2 mt-2 text-xs border"
          style={{
            backgroundColor: "#F5A623",
            color: "#000",
            borderColor: "#F5A623",
          }}
        >
          DEBUG: Test Button
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center justify-center my-6">
        <span className="w-1/3 border-b" style={{ borderColor: "#0B874F" }}></span>
        <span className="px-4 text-xs" style={{ color: "#F5A623" }}>OR</span>
        <span className="w-1/3 border-b" style={{ borderColor: "#0B874F" }}></span>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm" style={{ color: "#fff" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-bold hover:underline" style={{ color: "#0B874F" }}>
          Login here
        </Link>
      </p>
    </>
  );
}