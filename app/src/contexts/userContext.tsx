import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth-service";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const storedUser = await authService.getCurrentUser();
      if (storedUser.success) {
        setUser(storedUser.user);
      }
    }
    fetchData();
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
      navigate("/dashboard");
    } else {
      throw new Error(result.error);
    }
  };

  const getToken = () => {
    return localStorage.getItem("auth_token");
  };

  const logout = () => {
    setUser(null);
    authService.logout();
    navigate("/login");
  };

  const isLoggedIn = () => {
    return authService.isAuthenticated();
  };

  return <UserContext.Provider value={{ user, login, logout, isLoggedIn, getToken }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
