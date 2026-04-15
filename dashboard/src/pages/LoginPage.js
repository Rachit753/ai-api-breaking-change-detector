import { useState } from "react";
import axios from "axios";
import { saveToken } from "../utils/auth";
import BASE_URL from "../api/config";

function LoginPage({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    setMessage("");

    try {
      if (isSignup) {
        await axios.post(`${BASE_URL}/auth/signup`, {
          email,
          password,
        });

        setMessage("Signup successful! Please login.");
        setIsSignup(false);
      } else {
        const res = await axios.post(`${BASE_URL}/auth/login`, {
          email,
          password,
        });

        saveToken(res.data.token);
        onLogin();
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or error occurred");
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: "auto" }}>
      <h2>{isSignup ? "Signup" : "Login"}</h2>

      {message && <p style={{ color: "#10b981" }}>{message}</p>}
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={handleSubmit} style={{ width: "100%" }}>
        {isSignup ? "Signup" : "Login"}
      </button>

      <p style={{ marginTop: 15, textAlign: "center" }}>
        {isSignup ? "Already have an account?" : "Don't have an account?"}
      </p>

      <button
        onClick={() => {
          setIsSignup(!isSignup);
          setMessage("");
          setError("");
        }}
        style={{
          width: "100%",
          background: "#eee",
          border: "none",
          padding: 8,
          cursor: "pointer",
        }}
      >
        {isSignup ? "Go to Login" : "Sign up"}
      </button>
    </div>
  );
}

export default LoginPage;