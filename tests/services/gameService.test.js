const gameService = require('../../src/services/gameService');
const { Game, Player, Score } = require('../../src/models');

describe('Game Service', () => {
  let mockCreator;

  beforeEach(() => {
    mockCreator = {
      id: 1,
      username: 'creator',
      email: 'creator@example.com'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    it('debería crear un juego exitosamente', async () => {
      const gameData = {
        name: 'Test Game',
        maxPlayers: 4,
        creatorId: 1
      };

      const mockGame = {
        id: 1,
        ...gameData,
        status: 'waiting',
        addPlayer: jest.fn()
      };

      Game.create = jest.fn().mockResolvedValue(mockGame);

      const result = await gameService.createGame(gameData);

      expect(Game.create).toHaveBeenCalledWith({
        name: 'Test Game',
        maxPlayers: 4,
        creatorId: 1,
        status: 'waiting'
      });

      expect(mockGame.addPlayer).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockGame);
    });

    it('debería lanzar error si el juego no se puede crear', async () => {
      const gameData = {
        name: 'Test Game',
        maxPlayers: 4,
        creatorId: 1
      };

      Game.create = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(gameService.createGame(gameData))
        .rejects.toThrow('Database error');
    });
  });

  describe('getGameById', () => {
    it('debería obtener un juego por ID con sus relaciones', async () => {
      const mockGame = {
        id: 1,
        name: 'Test Game',
        players: [],
        creator: mockCreator,
        scores: []
      };

      Game.findByPk = jest.fn().mockResolvedValue(mockGame);

      const result = await gameService.getGameById(1);

      expect(Game.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: Player,
            as: 'players',
            through: { attributes: [] }
          },
          {
            model: Player,
            as: 'creator',
            attributes: ['id', 'username', 'email']
          },
          {
            model: Score,
            include: [
              {
                model: Player,
                attributes: ['id', 'username', 'email']
              }
            ]
          }
        ]
      });

      expect(result).toEqual(mockGame);
    });

    it('debería retornar null si el juego no existe', async () => {
      Game.findByPk = jest.fn().mockResolvedValue(null);

      const result = await gameService.getGameById(999);

      expect(result).toBeNull();
    });
  });

  describe('addPlayerToGame', () => {
    it('debería añadir un jugador a un juego exitosamente', async () => {
      const mockGame = {
        id: 1,
        status: 'waiting',
        maxPlayers: 4,
        players: [],
        addPlayer: jest.fn()
      };

      gameService.getGameById = jest.fn().mockResolvedValue(mockGame);

      const result = await gameService.addPlayerToGame(1, 2);

      expect(result).toEqual({ added: true });
      expect(mockGame.addPlayer).toHaveBeenCalledWith(2);
    });

    it('debería retornar error si el juego no existe', async () => {
      gameService.getGameById = jest.fn().mockResolvedValue(null);

      await expect(gameService.addPlayerToGame(999, 1))
        .rejects.toThrow('Juego no encontrado');
    });

    it('debería retornar error si el juego no está en estado de espera', async () => {
      const mockGame = {
        id: 1,
        status: 'playing',
        maxPlayers: 4,
        players: []
      };

      gameService.getGameById = jest.fn().mockResolvedValue(mockGame);

      await expect(gameService.addPlayerToGame(1, 2))
        .rejects.toThrow('El juego ya no está en estado de espera');
    });

    it('debería retornar error si el juego está lleno', async () => {
      const mockGame = {
        id: 1,
        status: 'waiting',
        maxPlayers: 2,
        players: [{ id: 1 }, { id: 2 }]
      };

      gameService.getGameById = jest.fn().mockResolvedValue(mockGame);

      await expect(gameService.addPlayerToGame(1, 3))
        .rejects.toThrow('El juego está lleno');
    });

    it('debería indicar si el jugador ya está en el juego', async () => {
      const mockGame = {
        id: 1,
        status: 'waiting',
        maxPlayers: 4,
        players: [{ id: 2 }],
        addPlayer: jest.fn()
      };

      gameService.getGameById = jest.fn().mockResolvedValue(mockGame);

      const result = await gameService.addPlayerToGame(1, 2);

      expect(result).toEqual({ alreadyInGame: true });
      expect(mockGame.addPlayer).not.toHaveBeenCalled();
    });
  });

  describe('startGame', () => {
    it('debería iniciar un juego exitosamente', async () => {
      const mockGame = {
        id: 1,
        creatorId: 1,
        status: 'waiting',
        players: [{ id: 1 }, { id: 2 }],
        update: jest.fn().mockResolvedValue([1])
      };

      gameService.getGameById = jest.fn().mockResolvedValue(mockGame);

      const result = await gameService.startGame(1, 1);

      expect(result).toEqual({ started: true });
      expect(mockGame.update).toHaveBeenCalledWith({ status: 'playing' });
    });

    it('debería retornar false si el solicitante no es el creador', async () => {
      const mockGame = {
        id: 1,
        creatorId: 1,
        status: 'waiting',
        players: [{ id: 1 }, { id: 2 }]
      };

      gameService.getGameById = jest.fn().mockResolvedValue(mockGame);

      const result = await gameService.startGame(1, 2);

      expect(result).toEqual({ started: false });
    });

    it('debería lanzar error si no hay suficientes jugadores', async () => {
      const mockGame = {
        id: 1,
        creatorId: 1,
        status: 'waiting',
        players: [{ id: 1 }]
      };

      gameService.getGameById = jest.fn().mockResolvedValue(mockGame);

      await expect(gameService.startGame(1, 1))
        .rejects.toThrow('Se necesitan al menos 2 jugadores para iniciar el juego');
    });
  });

  describe('getPlayersInGame', () => {
    it('debería obtener los jugadores de un juego', async () => {
      const mockGame = {
        id: 1,
        players: [
          { id: 1, username: 'player1' },
          { id: 2, username: 'player2' }
        ]
      };

      Game.findByPk = jest.fn().mockResolvedValue(mockGame);

      const result = await gameService.getPlayersInGame(1);

      expect(result).toEqual(['player1', 'player2']);
    });

    it('debería lanzar error si el juego no existe', async () => {
      Game.findByPk = jest.fn().mockResolvedValue(null);

      await expect(gameService.getPlayersInGame(999))
        .rejects.toThrow('Juego no encontrado');
    });
  });

  describe('listGames', () => {
    it('debería listar juegos con paginación', async () => {
      const mockGames = [
        { id: 1, name: 'Game 1' },
        { id: 2, name: 'Game 2' }
      ];

      const mockCount = 2;

      Game.findAndCountAll = jest.fn().mockResolvedValue({
        rows: mockGames,
        count: mockCount
      });

      const result = await gameService.listGames({
        page: 1,
        limit: 10,
        status: 'waiting'
      });

      expect(result).toEqual({
        games: mockGames,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      });

      expect(Game.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'waiting' },
        include: [
          {
            model: Player,
            as: 'creator',
            attributes: ['id', 'username', 'email']
          },
          {
            model: Player,
            as: 'players',
            through: { attributes: [] }
          }
        ],
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
    });
  });
});