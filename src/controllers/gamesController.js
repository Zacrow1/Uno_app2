const { Game, Player, Score } = require('../models');
const gameService = require('../services/gameService');
const { ApiStat } = require('../models/apiStat');

class GamesController {
  async createGame(req, res) {
    try {
      const { name, maxPlayers } = req.body;
      const creatorId = req.user.id; // Asumiendo que el middleware de auth añade req.user

      if (!name || !maxPlayers) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: name, maxPlayers'
        });
      }

      if (maxPlayers < 2 || maxPlayers > 8) {
        return res.status(400).json({
          error: 'El número máximo de jugadores debe estar entre 2 y 8'
        });
      }

      const game = await gameService.createGame({
        name,
        maxPlayers,
        creatorId
      });

      res.status(201).json({
        message: 'Juego creado exitosamente',
        game
      });
    } catch (error) {
      console.error('Error al crear juego:', error);
      res.status(500).json({
        error: 'Database error'
      });
    }
  }

  async getGame(req, res) {
    try {
      const { id } = req.params;
      const game = await gameService.getGameById(id);

      if (!game) {
        return res.status(404).json({
          error: 'Juego no encontrado'
        });
      }

      res.json(game);
    } catch (error) {
      console.error('Error al obtener juego:', error);
      res.status(500).json({
        error: 'Error interno al obtener juego'
      });
    }
  }

  async updateGame(req, res) {
    try {
      const { id } = req.params;
      const { name, maxPlayers, status } = req.body;

      const game = await gameService.updateGame(id, {
        name,
        maxPlayers,
        status
      });

      if (!game) {
        return res.status(404).json({
          error: 'Juego no encontrado'
        });
      }

      res.json({
        message: 'Juego actualizado exitosamente',
        game
      });
    } catch (error) {
      console.error('Error al actualizar juego:', error);
      res.status(500).json({
        error: 'Error interno al actualizar juego'
      });
    }
  }

  async deleteGame(req, res) {
    try {
      const { id } = req.params;
      const deleted = await gameService.deleteGame(id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Juego no encontrado'
        });
      }

      res.json({
        message: 'Juego eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar juego:', error);
      res.status(500).json({
        error: 'Error interno al eliminar juego'
      });
    }
  }

  async listGames(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const games = await gameService.listGames({
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });

      res.json(games);
    } catch (error) {
      console.error('Error al listar juegos:', error);
      res.status(500).json({
        error: 'Error interno al listar juegos'
      });
    }
  }

  async joinGame(req, res) {
    try {
      const { id } = req.params;
      const playerId = req.user.id;

      const result = await gameService.addPlayerToGame(id, playerId);

      if (result.alreadyInGame) {
        return res.status(409).json({
          error: 'El usuario ya está en el juego'
        });
      }

      res.json({
        message: 'Te has unido al juego exitosamente'
      });
    } catch (error) {
      console.error('Error al unirse al juego:', error);
      res.status(500).json({
        error: 'Error interno al unirse al juego'
      });
    }
  }

  async leaveGame(req, res) {
    try {
      const { id } = req.params;
      const playerId = req.user.id;

      const result = await gameService.removePlayerFromGame(id, playerId);

      if (!result.removed) {
        return res.status(404).json({
          error: 'El usuario no está en el juego'
        });
      }

      res.json({
        message: 'Has salido del juego exitosamente'
      });
    } catch (error) {
      console.error('Error al salir del juego:', error);
      res.status(500).json({
        error: 'Error interno al salir del juego'
      });
    }
  }

  async startGame(req, res) {
    try {
      const { id } = req.params;
      const playerId = req.user.id;

      const result = await gameService.startGame(id, playerId);

      if (!result.started) {
        return res.status(403).json({
          error: 'No tienes permiso para iniciar este juego'
        });
      }

      res.json({
        message: 'Juego iniciado exitosamente'
      });
    } catch (error) {
      console.error('Error al iniciar juego:', error);
      res.status(500).json({
        error: 'Error interno al iniciar juego'
      });
    }
  }

  async getGameState(req, res) {
    try {
      const { id } = req.params;
      const gameState = await gameService.getGameById(id);

      if (!gameState) {
        return res.status(404).json({
          error: 'Juego no encontrado'
        });
      }

      res.json({
        game_id: id,
        status: gameState.status,
        players: gameState.players || [],
        current_player: gameState.currentPlayer,
        top_card: gameState.topCard,
        scores: gameState.scores || []
      });
    } catch (error) {
      console.error('Error al obtener estado del juego:', error);
      res.status(500).json({
        error: 'Error interno al obtener estado del juego'
      });
    }
  }

  async getPlayersInGame(req, res) {
    try {
      const { id } = req.params;
      const players = await gameService.getPlayersInGame(id);

      res.json({
        game_id: id,
        players: players
      });
    } catch (error) {
      console.error('Error al obtener jugadores en juego:', error);
      res.status(500).json({
        error: 'Error interno al obtener jugadores en juego'
      });
    }
  }

  async getCurrentPlayer(req, res) {
    try {
      const { id } = req.params;
      const currentPlayer = await gameService.getCurrentPlayer(id);

      res.json({
        game_id: id,
        current_player: currentPlayer
      });
    } catch (error) {
      console.error('Error al obtener jugador actual:', error);
      res.status(500).json({
        error: 'Error interno al obtener jugador actual'
      });
    }
  }

  async getTopCard(req, res) {
    try {
      const { id } = req.params;
      const topCard = await gameService.getTopCard(id);

      res.json({
        game_id: id,
        top_card: topCard
      });
    } catch (error) {
      console.error('Error al obtener carta superior:', error);
      res.status(500).json({
        error: 'Error interno al obtener carta superior'
      });
    }
  }

  async getGameScores(req, res) {
    try {
      const { id } = req.params;
      const scores = await gameService.getGameScores(id);

      res.json({
        game_id: id,
        scores: scores
      });
    } catch (error) {
      console.error('Error al obtener scores del juego:', error);
      res.status(500).json({
        error: 'Error interno al obtener scores del juego'
      });
    }
  }
}

module.exports = new GamesController();