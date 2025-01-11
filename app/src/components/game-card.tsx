// @ts-nocheck
const gameCard = ({ game, joinGame }) => {
  return (
    <div className="card bg-base-100 w-96 shadow-xl mb-5 hover:shadow-2xl transition-shadow duration-300">
      <figure className="relative h-48 overflow-hidden">
        <img
          src="https://m.media-amazon.com/images/I/81ZNRHJ+cIL._AC_SL1500_.jpg"
          alt="Connect 4"
          className="w-full h-full object-cover"
        />
      </figure>
      <div className="card-body p-6">
        <h2 className="card-title text-2xl font-bold mb-2 truncate">
          Game <span className="text-primary">{game.id}</span>
        </h2>
        <div className="badge bg-green-200 badge-lg">{game.state.toUpperCase()}</div>

        {/* Conditionally display players if they exist */}
        {game.creator && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Creator: <span className="font-medium">{game.creator}</span>
            </p>
          </div>
        )}

        {/* Conditionally display winner if they exist */}
        {game.winner && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Winner: <span className="font-medium">{game.winner}</span>
            </p>
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary btn-lg w-full" onClick={() => joinGame(game.id)} disabled={game.state !== 'pending'}>
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default gameCard;
