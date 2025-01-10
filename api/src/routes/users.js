import { getUserById, getUsers, getUserStats, loginUser, registerUser, verifyEmail } from '../controllers/users.js';

export function usersRoutes(app) {
  app
    .post('/login', async (request, reply) => {
      reply.send(await loginUser(request.body, app));
    })
    .post('/logout', { preHandler: [app.authenticate] }, async (request, reply) => {
      const token = request.headers['authorization'].split(' ')[1]; // Récupérer le token depuis l'en-tête Authorization

      // Ajouter le token à la liste noire
      blacklistedTokens.push(token);

      reply.send({ logout: true });
    });
  //inscription
  app.post('/register', async (request, reply) => {
    reply.send(await registerUser(request.body, app.bcrypt));
  });
  //récupération de la liste des utilisateurs
  app.get('/users', async (request, reply) => {
    reply.send(await getUsers());
  });
  //récupération d'un utilisateur par son id
  app.get('/users/:id', async (request, reply) => {
    reply.send(await getUserById(request.params.id));
  });

  app.get('/verify-email/:token', async (request, reply) => {
    reply.send(await verifyEmail(request.params.token));
  });

  app.get('/users/me', async (request, reply) => {
    const token = request.headers['authorization'].split(' ')[1];
    const id = app.jwt.decode(token).id;
    const user = await getUserById(id);
    reply.send(user);
  });

  app.get('/users/:userId/stats', async (request, reply) => {
    try {
      const token = request.headers['authorization'].split(' ')[1];
      const id = app.jwt.decode(token).id;
      if (id !== request.params.userId) {
        reply.send({ error: 'Unauthorized access to user stats' });
      }

      const stats = await getUserStats(request.params.userId);

      if (stats.error) {
        reply.status(404).send(stats);
      }

      reply.send(stats);
    } catch (error) {
      console.error('Route error:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
