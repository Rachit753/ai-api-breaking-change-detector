import { useState } from "react";
import EndpointsPage from "./pages/EndpointsPage";
import LoginPage from "./pages/LoginPage";
import { getToken } from "./utils/auth";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return <EndpointsPage />;
}

export default App;
