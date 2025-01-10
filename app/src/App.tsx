// @ts-nocheck
import { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/navbar';
import { UserProvider, useUser } from './contexts/userContext';
import Dashboard from './pages/dashboard';
import Game from './pages/game';
import Login from './pages/login';
import Register from './pages/register';

const PrivateRoute = ({ element }) => {
  const { isLoggedIn } = useUser();

  return isLoggedIn() ? element : <Navigate to="/login" state={{ message: 'You must be logged in to access this page.' }} />;
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <Router>
      <UserProvider>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/game/:gameId" element={<PrivateRoute element={<Game />} />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
