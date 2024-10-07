import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth-service";

const Navbar = () => {
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
          MonApp
        </Link>
      </div>
      <div className="flex-none">
        {isAuthenticated ? (
          <>
            <span className="mr-4">Bienvenue, {currentUser?.email}</span>
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
    </div>
  );
};

export default Navbar;
