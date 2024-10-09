const gameCard = ({ game, joinGame }) => {
  return (
    <div className="card bg-base-100 w-96 shadow-xl mb-5" key={game.id}>
      <figure>
        <img src="https://m.media-amazon.com/images/I/81ZNRHJ+cIL._AC_SL1500_.jpg" alt="Connect 4" />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-ellipsis text-ls text-center font-bold text-2xl mb-2">
          Game <span>{game.id}</span>
        </h2>
        <div className="badge badge-secondary">{game.state.toUpperCase()}</div>
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary"
            onClick={() => joinGame(game.id)}
            disabled={game.state === "pending" ? false : true}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default gameCard;
