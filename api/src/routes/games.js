import dotenv from 'dotenv';
import { createGame, getGameById, getGames, updateGame } from '../controllers/games.js';

dotenv.config();

export function gamesRoutes(app) {
  //création d'un jeu
  app.post('/game', { preHandler: [app.authenticate] }, async (request, reply) => {
    reply.send(await createGame(request.body.userId));
  });
  //rejoindre un jeu
  app.patch('/game/:action/:gameId', { preHandler: [app.authenticate] }, async (request, reply) => {
    reply.send(await updateGame(request));
  });
  //obtenir tous les jeux
  app.get('/games', { preHandler: [app.authenticate] }, async (request, reply) => {
    reply.send(await getGames());
  });
  //obtenir un jeu par ID
  app.get('/game/:gameId', { preHandler: [app.authenticate] }, async (request, reply) => {
    reply.send(await getGameById(request.params.gameId));
  });
}
