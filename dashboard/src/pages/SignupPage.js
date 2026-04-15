import { useState } from "react";
import axios from "axios";
import BASE_URL from "../api/config";

function SignupPage({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        email,
        password,
      });

      alert("Signup successful");
      onSwitch();
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Signup</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleSignup}>Signup</button>
      <br /><br />
      <button onClick={onSwitch}>Go to Login</button>
    </div>
  );
}

export default SignupPage;