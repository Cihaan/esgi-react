// @ts-nocheck
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameCard from '../components/game-card';
import { useUser } from '../contexts/userContext';

import { API_URL } from '../constants';

const Dashboard = () => {
  const [userStats, setUserStats] = useState({
    totalGames: 0,
    wins: 0,
    totalScore: 0,
  });
  const { user, isLoggedIn, getToken } = useUser();
  const [gameId, setGameId] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [gameState, setGameState] = useState(null);
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames();
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    const token = getToken();
    console.log('token', { user, isLoggedIn, token });

    if (!user) {
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/users/${user.id}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserStats(response.data);
    } catch (error) {
      console.log('error', error);
      setError(`Error fetching stats: ${error.response?.data?.error || error.message}`);
    }
  };

  const fetchGames = async () => {
    const token = getToken();
    if (!isLoggedIn()) {
      setMessage('User is not logged in.');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/games`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGames(response.data);
    } catch (error) {
      setError(`Error: ${error.response.error}`);
    }
  };

  const createGame = async () => {
    const token = getToken();
    if (!isLoggedIn()) {
      setMessage('User is not logged in.');
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/game`,
        { userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.error) {
        setError(`Error: ${response.data.error}`);
        return;
      }
      setMessage(`Game created with ID: ${response.data.game.id}`);
      setGameState({ id: response.data.game.id, board: Array(6).fill(Array(7).fill(null)) });
      navigate('/game/' + response.data.game.id);
    } catch (error) {
      setError(`Error: ${error.response.error}`);
    } finally {
      await fetchGames(); // Refresh the list of games
    }
  };

  const joinGame = async (thisGame) => {
    const token = getToken();

    // Input validation
    if (!thisGame?.trim()) {
      setError('Please enter a valid game ID');
      return;
    }

    if (!isLoggedIn() || !user) {
      setMessage('Please log in to join a game.');
      return;
    }

    try {
      setError(''); // Clear any previous errors
      setMessage('Joining game...'); // Show loading state

      const response = await axios.patch(
        `${API_URL}/game/join/${thisGame}`,
        { userId: user.id },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (response.data.error) {
        setError(`Error: ${response.data.error}`);
        setMessage('');
        return;
      }

      // Show success message before navigating
      setMessage('Successfully joined game!');

      // Set game state
      setGameState({
        id: response.data.id,
        board: Array(6).fill(Array(7).fill(null)),
      });

      const errorMessage = error.response?.data?.error || error.message;
      setError(`Failed to join game: ${errorMessage}`);

      // Navigate to the game
      navigate(`/game/${response.data.id}`);
    } catch (error) {
      console.log('error', error);
      setError(`Error: ${error.response.error}`);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold">Dashboard</h1>
          <p className="py-4">Welcome to Connect 4.</p>
        </div>

        {isLoggedIn() && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stats bg-teal-100 text-primary-content shadow">
                <div className="stat">
                  <div className="stat-title">Total Games</div>
                  <div className="stat-value text-slate-500">{userStats.totalGames}</div>
                </div>
              </div>

              <div className="stats bg-teal-100 text-secondary-content shadow">
                <div className="stat">
                  <div className="stat-title">Wins</div>
                  <div className="stat-value text-slate-500">{userStats.wins}</div>
                </div>
              </div>

              <div className="stats bg-teal-100 text-accent-content shadow">
                <div className="stat">
                  <div className="stat-title">Total Score</div>
                  <div className="stat-value text-slate-500">{userStats.totalScore}</div>
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title justify-center mb-4">Game Controls</h2>
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                  <button onClick={createGame} className="btn btn-primary w-full md:w-auto">
                    Create New Game
                  </button>
                  <div className="join w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="Enter Game ID to Join"
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                      className="input input-bordered join-item w-full md:w-64"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          joinGame(gameId);
                        }
                      }}
                    />
                    <button onClick={() => joinGame(gameId)} className="btn btn-secondary join-item" disabled={!gameId.trim()}>
                      Join Game
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-4">
              {message && (
                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>{message}</span>
                </div>
              )}
              {error && (
                <div className="alert alert-error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </div>

            <br />

            {/* Available Games */}
            {games.filter((game) => game.state !== 'finished').length > 0 ? (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title justify-center">Available Games</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
                    {games
                      .filter((game) => game.state !== 'finished')
                      .map((game) => (
                        <div key={game.id}>{gameCard({ game, joinGame })}</div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title justify-center">Available Games</h2>
                  <p className="card-body justify-center">No games available</p>
                </div>
              </div>
            )}

            {/* Finished Games */}
            {games.filter((game) => game.state === 'finished').length > 0 ? (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title justify-center">Finished Games</h2>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {games
                      .filter((game) => game.state === 'finished')
                      .map((game) => (
                        <div key={game.id}>{gameCard({ game, joinGame })}</div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title justify-center">Finished Games</h2>
                  <p className="card-body justify-center">No finished games available</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
