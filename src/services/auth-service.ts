import axios from "axios";

const AUTH_KEY = "auth";
const USERS_KEY = "users";

const API_URL = "http://localhost:3000"; // Adjust the URL as needed

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      if (response.data.error) {
        return { success: false, error: response.data.error };
      }

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "An error occurred" };
    }
  },

  register: async (firstname: string, lastname: string, username: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/register`, { firstname, lastname, username, email, password });

      if (response.data.error) {
        return { success: false, error: response.data.error };
      }

      return { success: true, user: response.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "An error occurred" };
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser: () => {
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY));
    return auth ? auth.user : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_KEY);
  },
};
