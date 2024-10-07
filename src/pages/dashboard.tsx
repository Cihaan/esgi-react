import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Tableau de bord</h1>
          <p className="py-6">Bienvenue sur votre tableau de bord personnel.</p>
          <button className="btn btn-primary" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
