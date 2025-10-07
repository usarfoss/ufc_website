"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid reset link");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          newPassword 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid Reset Link</h1>
        <p className="text-gray-400 mb-4">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="text-[#0B874F] hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Title */}
      <h1
        className="text-2xl md:text-3xl font-extrabold text-center mb-3"
        style={{
          color: "#0B874F",
          textShadow: "2px 2px #00ff95",
          letterSpacing: "1px",
        }}
      >
        // RESET PASSWORD
      </h1>

      {/* Subtitle */}
      <p className="text-center text-xs md:text-sm mb-4" style={{ color: "#F5A623" }}>
        "Enter your new password below."
      </p>

      {/* Error Messages */}
      {error && (
        <div className="mb-4 p-3 border border-red-500 bg-red-500/10 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Success Messages */}
      {message && (
        <div className="mb-4 p-3 border border-green-500 bg-green-500/10 text-green-400 text-sm text-center">
          {message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block mb-1 text-xs md:text-sm font-bold" style={{ color: "#0B874F" }}>
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full px-3 py-2 text-sm border focus:outline-none transition-all duration-200"
            style={{
              backgroundColor: "#000",
              color: "#fff",
              borderColor: "#0B874F",
              boxShadow: "4px 4px 0px #0B874F",
            }}
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-1 text-xs md:text-sm font-bold" style={{ color: "#0B874F" }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-3 py-2 text-sm border focus:outline-none transition-all duration-200"
            style={{
              backgroundColor: "#000",
              color: "#fff",
              borderColor: "#0B874F",
              boxShadow: "4px 4px 0px #0B874F",
            }}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-3 text-sm font-bold border transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_#0B874F] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "#0B874F",
            color: "#000",
            borderColor: "#0B874F",
            boxShadow: "4px 4px 0px #0B874F",
          }}
        >
          {loading ? "RESETTING..." : "RESET PASSWORD →"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center justify-center my-4">
        <span className="w-1/3 border-b" style={{ borderColor: "#0B874F" }}></span>
        <span className="px-4 text-xs" style={{ color: "#F5A623" }}>OR</span>
        <span className="w-1/3 border-b" style={{ borderColor: "#0B874F" }}></span>
      </div>

      {/* Login Link */}
      <p className="text-center text-xs md:text-sm" style={{ color: "#fff" }}>
        Remember your password?{" "}
        <Link href="/login" className="font-bold hover:underline" style={{ color: "#0B874F" }}>
          Login here
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
