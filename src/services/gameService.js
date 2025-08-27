const { Game, Player, Score, Card } = require('../models');

class GameService {
  async createGame(gameData) {
    const { name, maxPlayers, creatorId } = gameData;

    const game = await Game.create({
      name,
      maxPlayers,
      creatorId,
      status: 'waiting'
    });

    // Añadir el creador como primer jugador
    await game.addPlayer(creatorId);

    return game;
  }

  async getGameById(id) {
    return await Game.findByPk(id, {
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
  }

  async updateGame(id, updateData) {
    const [updated] = await Game.update(updateData, {
      where: { id }
    });

    if (updated) {
      return await this.getGameById(id);
    }
    return null;
  }

  async deleteGame(id) {
    const deleted = await Game.destroy({
      where: { id }
    });
    return deleted > 0;
  }

  async listGames(options = {}) {
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;

    const where = status ? { status } : {};

    const { count, rows } = await Game.findAndCountAll({
      where,
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
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      games: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  async addPlayerToGame(gameId, playerId) {
    const game = await this.getGameById(gameId);
    
    if (!game) {
      throw new Error('Juego no encontrado');
    }

    if (game.status !== 'waiting') {
      throw new Error('El juego ya no está en estado de espera');
    }

    if (game.players.length >= game.maxPlayers) {
      throw new Error('El juego está lleno');
    }

    // Verificar si el jugador ya está en el juego
    const isPlayerInGame = game.players.some(player => player.id === playerId);
    if (isPlayerInGame) {
      return { alreadyInGame: true };
    }

    await game.addPlayer(playerId);
    return { added: true };
  }

  async removePlayerFromGame(gameId, playerId) {
    const game = await this.getGameById(gameId);
    
    if (!game) {
      throw new Error('Juego no encontrado');
    }

    await game.removePlayer(playerId);
    return { removed: true };
  }

  async startGame(gameId, playerId) {
    const game = await this.getGameById(gameId);
    
    if (!game) {
      throw new Error('Juego no encontrado');
    }

    if (game.creatorId !== playerId) {
      return { started: false };
    }

    if (game.players.length < 2) {
      throw new Error('Se necesitan al menos 2 jugadores para iniciar el juego');
    }

    await game.update({ status: 'playing' });
    return { started: true };
  }

  async getPlayersInGame(gameId) {
    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: Player,
          as: 'players',
          through: { attributes: [] },
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!game) {
      throw new Error('Juego no encontrado');
    }

    return game.players.map(player => player.username);
  }

  async getCurrentPlayer(gameId) {
    const game = await Game.findByPk(gameId);
    
    if (!game) {
      throw new Error('Juego no encontrado');
    }

    return game.currentPlayer;
  }

  async getTopCard(gameId) {
    const game = await Game.findByPk(gameId);
    
    if (!game) {
      throw new Error('Juego no encontrado');
    }

    return game.topCard;
  }

  async getGameScores(gameId) {
    const scores = await Score.findAll({
      where: { gameId },
      include: [
        {
          model: Player,
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['position', 'ASC'], ['score', 'DESC']]
    });

    return scores.map(score => ({
      player: score.player.username,
      score: score.score,
      position: score.position
    }));
  }
}

module.exports = new GameService();