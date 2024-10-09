import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className="w-12 h-12 border border-base-300 m-1 rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => dropPiece(colIndex)}
                  >
                    {cell !== 0 && (
                      <div
                        className={`w-10 h-10 rounded-full ${cell === 1 ? "bg-primary" : "bg-secondary"} ${
                          winningCells.some(([r, c]) => r === rowIndex && c === colIndex)
                            ? "ring-4 ring-accent ring-offset-2"
                            : ""
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            ))}
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
          {winner === null && <p className="mt-4 text-lg">Current Player: {currentPlayer === 1 ? "Red" : "Yellow"}</p>}
        </div>
      </div>
    </div>
  );
};

export default Game;
