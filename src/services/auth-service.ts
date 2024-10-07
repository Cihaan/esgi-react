// authService.js
const AUTH_KEY = "auth";
const USERS_KEY = "users";

export const authService = {
  login: (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      const token = Math.random().toString(36).substr(2);
      localStorage.setItem(AUTH_KEY, JSON.stringify({ user: { id: user.id, email: user.email }, token }));
      return { success: true, user: { id: user.id, email: user.email } };
    }
    return { success: false, error: "Invalid email or password" };
  },

  register: (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    if (users.some((u) => u.email === email)) {
      return { success: false, error: "Email already exists" };
    }
    const newUser = { id: users.length + 1, email, password };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, user: { id: newUser.id, email: newUser.email } };
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
