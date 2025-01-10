import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth-service';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = (
    <>
      {isAuthenticated ? (
        <>
          <li>
            <Link to="/dashboard">Tableau de bord</Link>
          </li>
          <li>
            <a onClick={handleLogout}>Se déconnecter</a>
          </li>
        </>
      ) : (
        <>
          <li>
            <Link to="/login">Se connecter</Link>
          </li>
          <li>
            <Link to="/register">S'inscrire</Link>
          </li>
        </>
      )}
      <li>
        <a onClick={toggleDarkMode}>{darkMode ? 'Light Mode' : 'Dark Mode'}</a>
      </li>
    </>
  );

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {menuItems}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl">
          <img
            width={60}
            src="https://img.freepik.com/vecteurs-libre/vecteur-degrade-logo-colore-oiseau_343694-1365.jpg"
            alt="logo"
            className="max-w-[60px]"
          />
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{menuItems}</ul>
      </div>
      <div className="navbar-end">{/* You can add additional end-aligned items here if needed */}</div>
    </div>
  );
};

export default Navbar;
