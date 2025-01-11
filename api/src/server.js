import chalk from 'chalk';
//pour fastify
import cors from '@fastify/cors';
import fastifyJWT from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify from 'fastify';
import fastifyBcrypt from 'fastify-bcrypt';
//routes
import { gamesRoutes } from './routes/games.js';
import { usersRoutes } from './routes/users.js';
//bdd
import { Server } from 'socket.io';
import { sequelize } from './bdd.js';
import { getGameById, updateGame } from './controllers/games.js';

import dotenv from 'dotenv';

dotenv.config();

//Test de la connexion
try {
  sequelize.authenticate();
  console.log(chalk.grey('Connecté à la base de données MySQL!'));
} catch (error) {
  console.error('Impossible de se connecter, erreur suivante :', error);
}

/**
 * API
 * avec fastify
 */
let blacklistedTokens = [];
const app = fastify();

const io = new Server(app.server, {
  cors: {
    origin: '*',
  },
});

// Game state
const games = new Map();

// Game logic
const ROWS = 6;
const COLS = 7;

const POINTS = {
  WIN: 3,
  DRAW: 1,
  LOSS: 0,
};

const createGame = (gameId) => ({
  id: gameId,
  players: [],
  board: Array(ROWS)
    .fill()
    .map(() => Array(COLS).fill(0)),
  currentPlayer: 1,
  status: 'pending',
});

const checkWinner = (board) => {
  const checkLine = (a, b, c, d) => {
    return (
      board[a[0]][a[1]] !== 0 &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]] &&
      board[a[0]][a[1]] === board[d[0]][d[1]]
    );
  };

  // Store winning cells if found
  let winningCells = [];

  // Check horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      if (checkLine([row, col], [row, col + 1], [row, col + 2], [row, col + 3])) {
        winningCells = [
          [row, col],
          [row, col + 1],
          [row, col + 2],
          [row, col + 3],
        ];
        return { winner: board[row][col], winningCells };
      }
    }
  }

  // Check vertical
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col < COLS; col++) {
      if (checkLine([row, col], [row + 1, col], [row + 2, col], [row + 3, col])) {
        winningCells = [
          [row, col],
          [row + 1, col],
          [row + 2, col],
          [row + 3, col],
        ];
        return { winner: board[row][col], winningCells };
      }
    }
  }

  // Check diagonal (top-left to bottom-right)
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      if (checkLine([row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3])) {
        winningCells = [
          [row, col],
          [row + 1, col + 1],
          [row + 2, col + 2],
          [row + 3, col + 3],
        ];
        return { winner: board[row][col], winningCells };
      }
    }
  }

  // Check diagonal (top-right to bottom-left)
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = COLS - 1; col >= 3; col--) {
      if (checkLine([row, col], [row + 1, col - 1], [row + 2, col - 2], [row + 3, col - 3])) {
        winningCells = [
          [row, col],
          [row + 1, col - 1],
          [row + 2, col - 2],
          [row + 3, col - 3],
        ];
        return { winner: board[row][col], winningCells };
      }
    }
  }

  // Check for a draw
  if (board.every((row) => row.every((cell) => cell !== 0))) {
    return { winner: 0, winningCells: [] };
  }

  return { winner: null, winningCells: [] };
};

// Socket.IO handler
io.on('connection', (socket) => {
  const socketToUser = new Map();

  socket.on('join', async ({ gameId, playerId }) => {
    console.log(`Player ${playerId} attempting to join game ${gameId}`);
    socketToUser.set(socket.id, playerId);

    try {
      let dbGame = await getGameById(gameId);
      console.log(`Database game:`, dbGame);

      // Create new game in memory if it doesn't exist
      if (!games.has(gameId)) {
        const gameState = createGame(gameId);
        games.set(gameId, gameState);
        console.log(`Created new game in memory:`, gameState);
      }

      const game = games.get(gameId);
      console.log(`Current game state:`, game);

      // Add player to game if not full
      if (game.players.length < 2 && !game.players.includes(socket.id)) {
        game.players.push(socket.id);
        socket.join(gameId);
        console.log(`Player ${socket.id} joined game ${gameId}`);

        const playerNumber = game.players.length;
        socket.emit('playerAssigned', { playerNumber });

        if (game.players.length === 2) {
          // Only update to 'playing' when second player joins
          const startResult = await updateGame({
            params: { action: 'start', gameId },
            body: { userId: playerId },
          });

          if (startResult.error) {
            socket.emit('error', { message: startResult.error });
            return;
          }

          game.status = 'playing';
          io.to(gameId).emit('gameStart', {
            board: game.board,
            currentPlayer: game.currentPlayer,
          });
          console.log(`Game ${gameId} started with 2 players`);
        } else {
          // First player - keep status as pending
          game.status = 'pending';
          socket.emit('waiting', { message: 'Waiting for opponent to join...' });
          console.log(`Game ${gameId} waiting for second player`);
        }
      } else {
        socket.emit('error', { message: 'Game is full or player already joined' });
      }
    } catch (error) {
      console.error(`Error joining game:`, error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  });

  socket.on('move', async ({ gameId, col }) => {
    console.log(`Player ${socket.id} made a move in game ${gameId} at column ${col}`);
    const game = games.get(gameId);
    if (!game || game.status !== 'playing') return;

    const playerIndex = game.players.indexOf(socket.id);
    if (playerIndex === -1 || playerIndex + 1 !== game.currentPlayer) return;

    const newBoard = game.board.map((row) => [...row]);
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === 0) {
        newBoard[row][col] = game.currentPlayer;
        game.board = newBoard;
        console.log(`Updated board: ${JSON.stringify(game.board)}`);

        const { winner, winningCells } = checkWinner(game.board);
        console.log(`Winner check: ${winner}, Winning cells: ${JSON.stringify(winningCells)}`);

        if (winner !== null) {
          let score;
          let winningPlayerId;

          if (winner === 0) {
            // It's a draw
            score = POINTS.DRAW;
            winningPlayerId = null;
          } else {
            // Someone won
            score = POINTS.WIN;
            winningPlayerId = socketToUser.get(game.players[winner - 1]);
          }

          await updateGame({
            params: { action: 'finish', gameId },
            body: {
              userId: socketToUser.get(socket.id),
              winner: winningPlayerId,
              score: score,
            },
          });

          game.status = 'finished';
          io.to(gameId).emit('gameOver', {
            board: game.board,
            winner,
            winningCells,
            score,
            winningPlayerId,
          });
          console.log(`Game ${gameId} finished with winner ${winner}, score: ${score}`);
        } else {
          game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;
          io.to(gameId).emit('gameUpdate', {
            board: game.board,
            currentPlayer: game.currentPlayer,
            lastMove: { row, col, player: playerIndex + 1 },
          });
          console.log(`Game ${gameId} updated, current player: ${game.currentPlayer}`);
        }
        break;
      }
    }
  });

  socket.on('disconnect', async () => {
    console.log(`Player ${socket.id} disconnected`);
    games.forEach(async (game, gameId) => {
      const playerIndex = game.players.indexOf(socket.id);
      if (playerIndex !== -1) {
        const winningPlayerSocket = game.players[playerIndex === 0 ? 1 : 0];
        const winningPlayerId = socketToUser.get(winningPlayerSocket);

        game.players.splice(playerIndex, 1);
        game.status = 'finished';

        await updateGame({
          params: { action: 'finish', gameId },
          body: {
            userId: socketToUser.get(socket.id),
            winner: winningPlayerId,
            score: POINTS.WIN, // Winner gets full points when opponent disconnects
          },
        });

        socketToUser.delete(socket.id);

        io.to(gameId).emit('playerLeft', {
          winner: winningPlayerId,
          score: POINTS.WIN,
        });
        console.log(`Player ${socket.id} left game ${gameId}, winner ${winningPlayerId} gets ${POINTS.WIN} points`);
      }
    });
  });
});

//Ajout du plugin fastify-bcrypt pour le hash du mdp
await app
  .register(fastifyBcrypt, {
    saltWorkFactor: 12,
  })
  .register(cors, {
    origin: '*',
  })
  .register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: "Documentation de l'API JDR LOTR",
        description: 'API développée pour un exercice avec React avec Fastify et Sequelize',
        version: '0.1.0',
      },
    },
  })
  .register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    theme: {
      title: 'Docs - JDR LOTR API',
    },
    uiConfig: {
      docExpansion: 'list',
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
    secret: 'unanneaupourlesgouvernertous',
  });
/**********
 * Routes
 **********/
app.get('/', (request, reply) => {
  reply.send({ documentationURL: 'http://localhost:3000/documentation' });
});
// Fonction pour décoder et vérifier le token
app.decorate('authenticate', async (request, reply) => {
  try {
    const token = request.headers['authorization'].split(' ')[1];

    // Vérifier si le token est dans la liste noire
    if (blacklistedTokens.includes(token)) {
      return reply.status(401).send({ error: 'Token invalide ou expiré' });
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
        console.log(chalk.green('Base de données synchronisée.'));
      })
      .catch((error) => {
        console.error('Erreur de synchronisation de la base de données :', error);
      });
    await app.listen({ port: 3000 });
    console.log('Serveur Fastify lancé sur ' + chalk.blue('http://localhost:3000'));
    console.log(chalk.bgYellow('Accéder à la documentation sur http://localhost:3000/documentation'));
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
