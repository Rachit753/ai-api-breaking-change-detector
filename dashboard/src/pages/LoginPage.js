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
      setError("Invalid credentials");
    }
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <div className="auth-form">
          <input
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleSubmit} className="primary-btn">
            {isSignup ? "Create Account" : "Login"}
          </button>
        </div>

        <div className="auth-footer">
          <p>
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}
          </p>

          <button
            className="secondary-btn"
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage("");
              setError("");
            }}
          >
            {isSignup ? "Login" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;