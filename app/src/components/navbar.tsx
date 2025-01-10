import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth-service";

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          <img
            width={60}
            src="https://img.freepik.com/vecteurs-libre/vecteur-degrade-logo-colore-oiseau_343694-1365.jpg"
            alt="logo"
          />
        </Link>
      </div>
      <div className="flex-none">
        {isAuthenticated ? (
          <>
            <span className="mr-4">Bienvenue, {currentUser?.username}</span>
            <Link to="/dashboard" className="btn btn-ghost normal-case">
              Tableau de bord
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost normal-case">
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost normal-case">
              Se connecter
            </Link>
            <Link to="/register" className="btn btn-ghost normal-case">
              S'inscrire
            </Link>
          </>
        )}
      </div>
      <div className="navbar-end">
        <button onClick={toggleDarkMode} className="btn btn-ghost">
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
