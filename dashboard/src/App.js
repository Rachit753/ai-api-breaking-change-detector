import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { getToken } from "./utils/auth";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return <Dashboard />;
}

export default App;
