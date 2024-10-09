import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Board from "../components/board";

const ROWS = 6;
const COLS = 7;

const Game = () => {
  const { gameId } = useParams();
  const [board, setBoard] = useState<number[][]>(Array(ROWS).fill(Array(COLS).fill(0)));
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<number | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);

  useEffect(() => {
    checkWinner();
  }, [board]);

  const dropPiece = (col: number) => {
    if (winner) return;

    const newBoard = board.map((row) => [...row]);
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === 0) {
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        break;
      }
    }
  };

  const checkWinner = () => {
    const checkLine = (a: number, b: number, c: number, d: number) => {
      if (
        board[a[0]][a[1]] !== 0 &&
        board[a[0]][a[1]] === board[b[0]][b[1]] &&
        board[a[0]][a[1]] === board[c[0]][c[1]] &&
        board[a[0]][a[1]] === board[d[0]][d[1]]
      ) {
        setWinner(board[a[0]][a[1]]);
        setWinningCells([a, b, c, d]);
        return true;
      }
      return false;
    };

    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        if (checkLine([row, col], [row, col + 1], [row, col + 2], [row, col + 3])) return;
      }
    }

    // Check vertical
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 0; col < COLS; col++) {
        if (checkLine([row, col], [row + 1, col], [row + 2, col], [row + 3, col])) return;
      }
    }

    // Check diagonal (top-left to bottom-right)
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        if (checkLine([row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3])) return;
      }
    }

    // Check diagonal (top-right to bottom-left)
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = COLS - 1; col >= 3; col--) {
        if (checkLine([row, col], [row + 1, col - 1], [row + 2, col - 2], [row + 3, col - 3])) return;
      }
    }

    // Check for a draw
    if (board.every((row) => row.every((cell) => cell !== 0))) {
      setWinner(0);
    }
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
          <h1 className="text-4xl font-bold mb-6">Connect Four - Game {gameId}</h1>
          <div className="bg-base-100 p-4 rounded-box shadow-xl">
            <Board board={board} winningCells={winningCells} dropPiece={dropPiece} />
          </div>

          {winner !== null && (
            <div className="mt-4">
              {winner === 0 ? (
                <h2 className="text-2xl font-bold">It's a draw!</h2>
              ) : (
                <h2 className="text-2xl font-bold">Player {winner} wins!</h2>
              )}
              <button className="btn btn-primary mt-2" onClick={resetGame}>
                Play Again
              </button>
            </div>
          )}
          {winner === null && (
            <p className="mt-4 text-lg">
              Player's turn :{" "}
              <span className={currentPlayer === 1 ? "text-primary font-bold" : "text-secondary font-bold"}>
                {currentPlayer === 1 ? "Blue" : "Pink"}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
