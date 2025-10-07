"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<'email' | 'password'>('email');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload: Record<string, string> = { email };
      if (stage === 'password') {
        payload.newPassword = newPassword;
      }

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Request failed');
      } else if (stage === 'email') {
        // Email exists, move to password stage
        setStage('password');
        setMessage('User found. Please enter your new password.');
      } else {
        // Password changed
        setMessage('Password updated successfully. You can now log in.');
      }
    } catch (err) {
      setError('Request failed');
    } finally {
      setLoading(false);
    }
  };

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
        // FORGOT PASSWORD
      </h1>

      {/* Subtitle */}
      <p className="text-center text-xs md:text-sm mb-4" style={{ color: "#F5A623" }}>
        {stage === 'email' ? 'Enter your email to continue.' : 'Enter your new password.'}
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
        {stage === 'email' ? (
          <div>
            <label className="block mb-1 text-xs md:text-sm font-bold" style={{ color: "#0B874F" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
        ) : (
          <>
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
          </>
        )}

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
          {loading ? (stage === 'email' ? 'CHECKING...' : 'UPDATING...') : (stage === 'email' ? 'CONTINUE →' : 'UPDATE PASSWORD →')}
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
