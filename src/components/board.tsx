const Connect4Board = ({ board, onMakeMove, currentPlayer }) => {
  const renderCell = (cell, rowIndex, colIndex) => {
    const cellColor = cell === 1 ? "bg-red-500" : cell === 2 ? "bg-yellow-500" : "bg-white";
    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`w-12 h-12 rounded-full ${cellColor} border-2 border-blue-500 m-1`}
        onClick={() => onMakeMove(colIndex)}
      />
    );
  };

  return (
    <div className="bg-blue-400 p-4 rounded-lg">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
        </div>
      ))}
      <div className="mt-4 text-white font-bold">Current Player: {currentPlayer === 1 ? "Red" : "Yellow"}</div>
    </div>
  );
};

export default Connect4Board;
