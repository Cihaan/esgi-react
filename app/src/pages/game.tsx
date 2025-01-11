// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Board from '../components/board';
import { API_URL } from '../constants';
import { useUser } from '../contexts/userContext';

interface GameScore {
  score: number;
  winningPlayerId: string | null;
}

const ROWS = 6;
const COLS = 7;

const Game = () => {
  const [gameScore, setGameScore] = useState<GameScore | null>(null);
  const { user } = useUser();
  const { gameId } = useParams();
  const [board, setBoard] = useState<number[][]>(Array(ROWS).fill(Array(COLS).fill(0)));
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<number | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  } | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const socket = io(API_URL);
    socketRef.current = socket;

    socket.emit('join', {
      gameId,
      playerId: user.id,
    });

    socket.on('waiting', ({ message }) => {
      setNotification({
        message: message,
        type: 'info',
      });
    });

    socket.on('playerAssigned', ({ playerNumber }) => {
      setPlayerNumber(playerNumber);
      setNotification({
        message: `You are Player ${playerNumber} (${playerNumber === 1 ? 'Blue' : 'Pink'})`,
        type: 'success',
      });
      setTimeout(() => setNotification(null), 3000);
    });

    socket.on('gameStart', ({ board, currentPlayer }) => {
      setBoard(board);
      setCurrentPlayer(currentPlayer);
      setGameStatus('playing');
      setNotification({
        message: 'Game started! Good luck!',
        type: 'info',
      });
      setTimeout(() => setNotification(null), 3000);
    });

    socket.on('gameUpdate', ({ board, currentPlayer }) => {
      setBoard(board);
      setCurrentPlayer(currentPlayer);
    });

    socket.on('gameOver', ({ winner, winningCells, board, score, winningPlayerId }) => {
      setBoard(board);
      setWinner(winner);
      setWinningCells(winningCells);
      setGameStatus('finished');
      setGameScore({ score, winningPlayerId });

      // Show score notification
      let scoreMessage = '';
      if (winner === 0) {
        scoreMessage = `Draw! Both players get ${score} point`;
      } else if (winningPlayerId === user.id) {
        scoreMessage = `You won! +${score} points`;
      } else {
        scoreMessage = `You lost! +0 points`;
      }

      setNotification({
        message: scoreMessage,
        type: winner === 0 ? 'info' : winningPlayerId === user.id ? 'success' : 'error',
      });
    });

    socket.on('playerLeft', ({ winner, score }) => {
      setNotification({
        message: winner === user.id ? `Other player left. You win! +${score} points` : 'You left the game',
        type: winner === user.id ? 'success' : 'error',
      });
      setGameStatus('finished');
      setGameScore({ score, winningPlayerId: winner });
    });

    socket.on('error', ({ message }) => {
      setNotification({
        message: message,
        type: 'error',
      });
      setTimeout(() => setNotification(null), 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId]);

  const dropPiece = (col: number) => {
    if (winner || playerNumber !== currentPlayer) return;

    socketRef.current.emit('move', {
      gameId,
      col,
    });
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(Array(COLS).fill(0)));
    setCurrentPlayer(1);
    setWinner(null);
    setWinningCells([]);
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          {/* Notification Toast */}
          {notification && (
            <div className="toast toast-top toast-center">
              <div className={`alert alert-${notification.type}`}>
                <span>{notification.message}</span>
              </div>
            </div>
          )}

          <h1 className="text-4xl font-bold mb-6">Connect Four - Game</h1>
          <h2 className="text-sm font-normal mb-6">{gameId}</h2>
          {/* Copy Game ID Button */}
          <div className="mb-4">
            <button
              className="btn btn-outline"
              onClick={() => {
                navigator.clipboard.writeText(gameId || '');
                setNotification({
                  message: 'Game ID copied to clipboard!',
                  type: 'success',
                });
                setTimeout(() => setNotification(null), 3000);
              }}
            >
              Copy Game ID
            </button>
          </div>

          {/* Game Status Badge */}
          <div className="mb-4">
            <div
              className={`badge badge-lg ${
                gameStatus === 'waiting' ? 'badge-warning' : gameStatus === 'playing' ? 'badge-success' : 'badge-neutral'
              }`}
            >
              {gameStatus === 'waiting' ? 'Waiting for Players' : gameStatus === 'playing' ? 'Game In Progress' : 'Game Finished'}
            </div>
          </div>

          {gameStatus === 'waiting' && !playerNumber && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title justify-center">Waiting for players...</h2>
                <div className="flex justify-center">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
                <p className="text-sm opacity-75">Share this game ID with your friend: {gameId}</p>
              </div>
            </div>
          )}

          {playerNumber && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="bg-base-100 rounded-box">
                  <Board board={board} winningCells={winningCells} dropPiece={dropPiece} />
                </div>

                {winner !== null ? (
                  <div className="mt-4">
                    {winner === 0 ? (
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
                        <span className="text-2xl font-bold">It's a draw!</span>
                        {gameScore && <p className="text-sm">Both players get {gameScore.score} point</p>}
                      </div>
                    ) : (
                      <div className={`alert ${winner === playerNumber ? 'alert-success' : 'alert-error'}`}>
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-2xl font-bold">{winner === playerNumber ? 'You won!' : 'You lost!'}</span>
                        {gameScore && (
                          <p className="text-sm">
                            {gameScore.winningPlayerId === user.id ? `+${gameScore.score} points` : '+0 points'}
                          </p>
                        )}
                      </div>
                    )}
                    <button className="btn btn-primary mt-4" onClick={resetGame}>
                      Play Again
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <div className={`alert ${currentPlayer === playerNumber ? 'alert-success' : 'alert-warning'} shadow-lg`}>
                      <div>
                        {currentPlayer === playerNumber ? (
                          <>
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Your turn!</span>
                          </>
                        ) : (
                          <>
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            <span>Opponent's turn</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="badge badge-outline gap-2">
                      You are Player {playerNumber} ({playerNumber === 1 ? 'Blue' : 'Pink'})
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
