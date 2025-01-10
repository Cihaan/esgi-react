const Board = ({ board, winningCells, dropPiece }) => {
  return board.map((row, rowIndex) => (
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
                winningCells.some(([r, c]) => r === rowIndex && c === colIndex) ? "ring-4 ring-accent ring-offset-2" : ""
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  ));
};

export default Board;
