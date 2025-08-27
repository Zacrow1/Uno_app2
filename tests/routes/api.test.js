const request = require('supertest');
const app = require('../../src/app');
const { Player, Game, Card, Score } = require('../../src/models');

describe('API Routes Integration Tests', () => {
  let testPlayer;
  let testGame;
  let authToken;

  beforeAll(async () => {
    // Crear jugador de prueba
    testPlayer = await Player.create({
      username: 'testplayer',
      email: 'test@example.com',
      password: 'hashedpassword123'
    });

    // Crear juego de prueba
    testGame = await Game.create({
      name: 'Test Game',
      maxPlayers: 4,
      status: 'waiting',
      creatorId: testPlayer.id
    });

    // Simular token de autenticación
    authToken = 'Bearer mock.jwt.token';
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await Player.destroy({ where: {} });
    await Game.destroy({ where: {} });
    await Card.destroy({ where: {} });
    await Score.destroy({ where: {} });
  });

  describe('Players API', () => {
    describe('POST /api/players', () => {
      it('debería crear un jugador exitosamente', async () => {
        const playerData = {
          username: 'newplayer',
          email: 'newplayer@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/players')
          .send(playerData)
          .expect(201);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('player');
        expect(response.body.player).toHaveProperty('id');
        expect(response.body.player.username).toBe(playerData.username);
      });

      it('debería retornar error 400 cuando faltan campos obligatorios', async () => {
        const playerData = {
          username: 'incomplete'
        };

        const response = await request(app)
          .post('/api/players')
          .send(playerData)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/players/:id', () => {
      it('debería obtener un jugador por ID', async () => {
        const response = await request(app)
          .get(`/api/players/${testPlayer.id}`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('username');
        expect(response.body).toHaveProperty('email');
      });

      it('debería retornar error 404 cuando el jugador no existe', async () => {
        const response = await request(app)
          .get('/api/players/999')
          .set('Authorization', authToken)
          .expect(404);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('PUT /api/players/:id', () => {
      it('debería actualizar un jugador exitosamente', async () => {
        const updateData = {
          username: 'updatedplayer',
          email: 'updated@example.com'
        };

        const response = await request(app)
          .put(`/api/players/${testPlayer.id}`)
          .set('Authorization', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('player');
        expect(response.body.player.username).toBe(updateData.username);
      });
    });

    describe('DELETE /api/players/:id', () => {
      it('debería eliminar un jugador exitosamente', async () => {
        const tempPlayer = await Player.create({
          username: 'tempplayer',
          email: 'temp@example.com',
          password: 'hashedpassword123'
        });

        const response = await request(app)
          .delete(`/api/players/${tempPlayer.id}`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body).toHaveProperty('message');

        // Verificar que el jugador fue eliminado
        const deletedPlayer = await Player.findByPk(tempPlayer.id);
        expect(deletedPlayer).toBeNull();
      });
    });
  });

  describe('Authentication API', () => {
    describe('POST /api/players/register', () => {
      it('debería registrar un usuario exitosamente', async () => {
        const userData = {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/players')
          .send(userData)
          .expect(201);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('player');
      });
    });

    describe('POST /api/players/login', () => {
      it('debería iniciar sesión exitosamente con credenciales válidas', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/players/login')
          .send(userData)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('token');
      });

      it('debería retornar error 401 con credenciales inválidas', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };

        const response = await request(app)
          .post('/api/players/login')
          .send(userData)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('Games API', () => {
    describe('POST /api/games', () => {
      it('debería crear un juego exitosamente', async () => {
        const gameData = {
          name: 'New Test Game',
          maxPlayers: 4
        };

        const response = await request(app)
          .post('/api/games')
          .set('Authorization', authToken)
          .send(gameData)
          .expect(201);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('game');
        expect(response.body.game.name).toBe(gameData.name);
      });
    });

    describe('GET /api/games/:id', () => {
      it('debería obtener un juego por ID', async () => {
        const response = await request(app)
          .get(`/api/games/${testGame.id}`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body.name).toBe(testGame.name);
      });
    });
  });

  describe('Cards API', () => {
    describe('POST /api/cards', () => {
      it('debería crear una tarjeta exitosamente', async () => {
        const cardData = {
          color: 'red',
          type: 'number',
          value: '5'
        };

        const response = await request(app)
          .post('/api/cards')
          .set('Authorization', authToken)
          .send(cardData)
          .expect(201);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('card');
        expect(response.body.card.color).toBe(cardData.color);
      });
    });

    describe('GET /api/cards/:id', () => {
      it('debería obtener una tarjeta por ID', async () => {
        const testCard = await Card.create({
          color: 'blue',
          type: 'number',
          value: '3'
        });

        const response = await request(app)
          .get(`/api/cards/${testCard.id}`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('color');
        expect(response.body.color).toBe(testCard.color);
      });
    });
  });

  describe('Scores API', () => {
    describe('POST /api/scores', () => {
      it('debería crear un score exitosamente', async () => {
        const scoreData = {
          score: 100,
          position: 1,
          playerId: testPlayer.id,
          gameId: testGame.id
        };

        const response = await request(app)
          .post('/api/scores')
          .set('Authorization', authToken)
          .send(scoreData)
          .expect(201);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('score');
        expect(response.body.score.score).toBe(scoreData.score);
      });
    });

    describe('GET /api/scores/:id', () => {
      it('debería obtener un score por ID', async () => {
        const testScore = await Score.create({
          score: 50,
          position: 2,
          playerId: testPlayer.id,
          gameId: testGame.id
        });

        const response = await request(app)
          .get(`/api/scores/${testScore.id}`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('score');
        expect(response.body.score).toBe(testScore.score);
      });
    });
  });

  describe('Error Handling', () => {
    it('debería manejar rutas no encontradas', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});