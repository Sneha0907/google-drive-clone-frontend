import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE; // e.g. https://google-drive-clone-backend-hdqf.onrender.com

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function call(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { session } = await call("/api/auth/login"); // auth routes keep /api
      if (!session?.access_token) throw new Error("No access token returned");
      login(session.access_token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await call("/api/auth/signup");
      const { session } = await call("/api/auth/login");
      if (!session?.access_token) throw new Error("No access token returned");
      login(session.access_token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold mb-6">Welcome to Nimbus Drive</h1>

      <form className="space-y-3" onSubmit={handleLogin}>
        <input
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          required
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2">
          <button
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded"
          >
            {loading ? "Loading..." : "Log in"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSignup}
            className="border px-4 py-2 rounded"
          >
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}
