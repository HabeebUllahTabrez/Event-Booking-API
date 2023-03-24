import { useState } from "react";
import {
  Routes,
  Route,
  BrowserRouter as Router,
  Navigate,
} from "react-router-dom";
import "./App.css";
import MainNavigation from "./components/Navigation/MainNavigation";
import AuthContext from "./context/auth-context";
import Auth from "./pages/Auth";
import Bookings from "./pages/Bookings";
import Events from "./pages/Events";

function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const login = (token, userId, tokenExpiration) => {
    setToken(token);
    setUserId(userId);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
  };

  return (
    <Router>
      <AuthContext.Provider
        value={{ token: token, userId: userId, login: login, logout: logout }}
      >
        <MainNavigation />
        <main className="main-content">
          <Routes>
            {!token && (
              <Route path="/" element={<Navigate replace to="/auth" />}></Route>
            )}
            {token && (
              <Route
                path="/"
                element={<Navigate replace to="/events" />}
              ></Route>
            )}
            {token && (
              <Route
                path="/auth"
                element={<Navigate replace to="/events" />}
              ></Route>
            )}
            {!token && <Route path="/auth" element={<Auth />}></Route>}
            <Route path="/events" element={<Events />}></Route>
            {token && <Route path="/bookings" element={<Bookings />}></Route>}
          </Routes>
        </main>
      </AuthContext.Provider>
    </Router>
  );
}

export default App;
