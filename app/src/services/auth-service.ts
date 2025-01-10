// @ts-nocheck
import axios from 'axios';

const AUTH_KEY = 'auth_token';
const USER_KEY = 'user';

import { API_URL } from '../constants';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      if (response.data.error) {
        return { success: false, error: response.data.error };
      }

      const token = response.data.token;
      localStorage.setItem(AUTH_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

      return { success: true, user: response.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'An error occurred' };
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
      return { success: false, error: error.response?.data?.error || 'An error occurred' };
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_KEY);
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem(AUTH_KEY);
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.error) {
        return { success: false, error: response.data.error };
      }

      return { success: true, user: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'An error occurred' };
    }
  },
};
