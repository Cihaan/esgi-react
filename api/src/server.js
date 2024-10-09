import chalk from "chalk";
//pour fastify
import cors from "@fastify/cors";
import fastifyJWT from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
//routes
import { gamesRoutes } from "./routes/games.js";
import { usersRoutes } from "./routes/users.js";
//bdd
import { Server } from "socket.io";
import { sequelize } from "./bdd.js";

//Test de la connexion
try {
  sequelize.authenticate();
  console.log(chalk.grey("Connecté à la base de données MySQL!"));
} catch (error) {
  console.error("Impossible de se connecter, erreur suivante :", error);
}

/**
 * API
 * avec fastify
 */
let blacklistedTokens = [];
const app = fastify();

const io = new Server(app.server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
});

// Game state
const games = new Map();

// Game logic
const ROWS = 6;
const COLS = 7;

function createGame(gameId) {
  return {
    id: gameId,
    board: Array(ROWS)
      .fill()
      .map(() => Array(COLS).fill(0)),
    currentPlayer: 1,
    players: [],
    spectators: [],
    chat: [],
  };
}

function checkWinner(board, row, col) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    for (const direction of [-1, 1]) {
      for (let i = 1; i < 4; i++) {
        const newRow = row + i * direction * dx;
        const newCol = col + i * direction * dy;
        if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS || board[newRow][newCol] !== board[row][col]) {
          break;
        }
        count++;
      }
    }
    if (count >= 4) return true;
  }
  return false;
}

// Socket.IO handler
io.on("connection", (socket) => {
  socket.on("join", (data) => {
    handleJoin(socket, data);
  });

  socket.on("move", (data) => {
    handleMove(socket, data);
  });

  socket.on("disconnect", () => {
    handleDisconnect(socket);
  });
});

function handleJoin(socket, data) {
  const { gameId, playerId } = data;

  if (!games.has(gameId)) {
    games.set(gameId, createGame(gameId));
  }

  const game = games.get(gameId);

  if (game.players.length >= 2) {
    socket.emit("error", { message: "Game is full" });
    return;
  }

  game.players.push({ id: playerId, socket });
  socket.gameId = gameId;
  socket.playerId = playerId;

  socket.emit("joined", { gameState: game });

  if (game.players.length === 2) {
    broadcastToGame(game, { type: "gameStart", gameState: game });
  }
}

function handleMove(socket, data) {
  const { gameId, playerId, col } = data;
  const game = games.get(gameId);

  if (!game) {
    socket.emit("error", { message: "Game not found" });
    return;
  }

  if (game.players[game.currentPlayer - 1].id !== playerId) {
    socket.emit("error", { message: "Not your turn" });
    return;
  }

  for (let row = ROWS - 1; row >= 0; row--) {
    if (game.board[row][col] === 0) {
      game.board[row][col] = game.currentPlayer;

      if (checkWinner(game.board, row, col)) {
        broadcastToGame(game, { type: "gameOver", winner: game.currentPlayer, gameState: game });
        games.delete(gameId);
      } else if (game.board.every((row) => row.every((cell) => cell !== 0))) {
        broadcastToGame(game, { type: "gameOver", winner: 0, gameState: game });
        games.delete(gameId);
      } else {
        game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;
        broadcastToGame(game, { type: "updateGame", gameState: game });
      }

      break;
    }
  }
}

function handleDisconnect(socket) {
  const { gameId, playerId } = socket;
  const game = games.get(gameId);

  if (!game) return;

  game.players = game.players.filter((player) => player.id !== playerId);
  broadcastToGame(game, { type: "playerDisconnected", playerId });

  if (game.players.length === 0) {
    games.delete(gameId);
  }
}

function broadcastToGame(game, message) {
  game.players.forEach((pl) => {
    pl.socket.emit(message.type, message);
  });
}

//Ajout du plugin fastify-bcrypt pour le hash du mdp
await app
  .register(fastifyBcrypt, {
    saltWorkFactor: 12,
  })
  .register(cors, {
    origin: "*",
  })
  .register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Documentation de l'API JDR LOTR",
        description: "API développée pour un exercice avec React avec Fastify et Sequelize",
        version: "0.1.0",
      },
    },
  })
  .register(fastifySwaggerUi, {
    routePrefix: "/documentation",
    theme: {
      title: "Docs - JDR LOTR API",
    },
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  })
  .register(fastifyJWT, {
    secret: "unanneaupourlesgouvernertous",
  });
/**********
 * Routes
 **********/
app.get("/", (request, reply) => {
  reply.send({ documentationURL: "http://localhost:3000/documentation" });
});
// Fonction pour décoder et vérifier le token
app.decorate("authenticate", async (request, reply) => {
  try {
    const token = request.headers["authorization"].split(" ")[1];

    // Vérifier si le token est dans la liste noire
    if (blacklistedTokens.includes(token)) {
      return reply.status(401).send({ error: "Token invalide ou expiré" });
    }
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});
//gestion utilisateur
usersRoutes(app);
//gestion des jeux
gamesRoutes(app);

/**********
 * START
 **********/
const start = async () => {
  try {
    await sequelize
      .sync({ alter: true })
      .then(() => {
        console.log(chalk.green("Base de données synchronisée."));
      })
      .catch((error) => {
        console.error("Erreur de synchronisation de la base de données :", error);
      });
    await app.listen({ port: 3000 });
    console.log("Serveur Fastify lancé sur " + chalk.blue("http://localhost:3000"));
    console.log(chalk.bgYellow("Accéder à la documentation sur http://localhost:3000/documentation"));
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
