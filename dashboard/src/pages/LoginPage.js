import { useState } from "react";
import axios from "axios";
import { saveToken } from "../utils/auth";

function LoginPage({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit() {
    try {
      if (isSignup) {
      
        await axios.post("http://localhost:5000/api/auth/signup", {
          email,
          password,
        });

        alert("Signup successful! Please login.");
        setIsSignup(false);
      } else {
        
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password,
        });

        saveToken(res.data.token);
        onLogin();
      }
    } catch (err) {
      alert("Something went wrong");
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: "auto" }}>
      <h2>{isSignup ? "Signup" : "Login"}</h2>

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
        onClick={() => setIsSignup(!isSignup)}
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