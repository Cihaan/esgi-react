import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/userContext";

const Dashboard = () => {
  const { user, isLoggedIn, getToken } = useUser();
  const [gameId, setGameId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [gameState, setGameState] = useState(null);
  const API_URL = "http://localhost:3000";
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    wsRef.current = new WebSocket("ws://localhost:3000/gameStream");

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
    };
  }, []);

  const createGame = async () => {
    const token = getToken();
    if (!isLoggedIn()) {
      setMessage("User is not logged in.");
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
      setMessage(`Game created with ID: ${response.data.gameId}`);
      setGameState({ id: response.data.gameId, board: Array(6).fill(Array(7).fill(null)) });
    } catch (error) {
      setError(`Error: ${error.response.data.error}`);
    }
  };

  const joinGame = async () => {
    const token = getToken();
    if (!isLoggedIn() || !user || !gameId) {
      setMessage("Unable to join game. Check login status and game ID.");
      return;
    }
    try {
      const response = await axios.patch(
        `${API_URL}/game/join/${gameId}`,
        { userId: user.id },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (response.data.error) {
        setError(`Error: ${response.data.error}`);
        return;
      }
      setMessage(`Joined game with ID: ${response.data.id}`);
      setGameState({ id: response.data.id, board: Array(6).fill(Array(7).fill(null)) });
    } catch (error) {
      setError(`Error: ${error.response.data.error}`);
    }
  };

  const makeMove = (col) => {
    if (!gameState || !wsRef.current) return;

    // Send move to server via WebSocket
    wsRef.current.send(
      JSON.stringify({
        type: "move",
        move: { col },
        player: user.id,
        gameId: gameState.id,
      })
    );
  };

  const sendChat = (message) => {
    if (!gameState || !wsRef.current) return;

    // Send chat message to server via WebSocket
    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        message,
        player: user.id,
        gameId: gameState.id,
      })
    );
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Dashboard</h1>
          <p className="py-6">Welcome to your personal dashboard.</p>
          {isLoggedIn() ? (
            <>
              <div>
                <button onClick={createGame} className="btn btn-primary mt-4">
                  Create Game
                </button>
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Game ID"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
                <button onClick={joinGame} className="btn btn-secondary mt-4">
                  Join Game
                </button>
              </div>
              {gameState && (
                <div className="mt-4">
                  <h2>Game Board</h2>
                  {/* Add your Connect 4 game board rendering here */}
                  {/* Use the makeMove function when a player clicks a column */}
                </div>
              )}
              {message && (
                <div className="alert alert-info mt-4">
                  <p>{message}</p>
                </div>
              )}
              {error && (
                <div className="alert alert-error mt-4">
                  <p>{error}</p>
                </div>
              )}
            </>
          ) : (
            <p>Please log in to create or join games.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
