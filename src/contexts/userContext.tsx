import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth-service";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
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

  const logout = () => {
    setUser(null);
    authService.logout();
    navigate("/login");
  };

  const isLoggedIn = () => {
    return authService.isAuthenticated();
  };

  return <UserContext.Provider value={{ user, login, logout, isLoggedIn }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
