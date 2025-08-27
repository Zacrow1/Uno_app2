const { Player } = require('../models/player');
const playerService = require('../services/playerService');
const { ApiStat } = require('../models/apiStat');

class PlayersController {
  async createPlayer(req, res) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: username, email, password'
        });
      }

      const existingPlayer = await Player.findOne({
        where: { email }
      });

      if (existingPlayer) {
        return res.status(400).json({
          error: 'El email ya está registrado'
        });
      }

      const player = await playerService.createPlayer({
        username,
        email,
        password
      });

      res.status(201).json({
        message: 'Jugador creado exitosamente',
        player: {
          id: player.id,
          username: player.username,
          email: player.email
        }
      });
    } catch (error) {
      console.error('Error al crear jugador:', error);
      res.status(500).json({
        error: 'Error interno al crear jugador'
      });
    }
  }

  async getPlayer(req, res) {
    try {
      const { id } = req.params;
      const player = await playerService.getPlayerById(id);

      if (!player) {
        return res.status(404).json({
          error: 'Jugador no encontrado'
        });
      }

      res.json(player);
    } catch (error) {
      console.error('Error al obtener jugador:', error);
      res.status(500).json({
        error: 'Error interno al obtener jugador'
      });
    }
  }

  async updatePlayer(req, res) {
    try {
      const { id } = req.params;
      const { username, email } = req.body;

      const player = await playerService.updatePlayer(id, {
        username,
        email
      });

      if (!player) {
        return res.status(404).json({
          error: 'Jugador no encontrado'
        });
      }

      res.json({
        message: 'Jugador actualizado exitosamente',
        player
      });
    } catch (error) {
      console.error('Error al actualizar jugador:', error);
      res.status(500).json({
        error: 'Error interno al actualizar jugador'
      });
    }
  }

  async deletePlayer(req, res) {
    try {
      const { id } = req.params;
      const deleted = await playerService.deletePlayer(id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Jugador no encontrado'
        });
      }

      res.json({
        message: 'Jugador eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      res.status(500).json({
        error: 'Error interno al eliminar jugador'
      });
    }
  }

  async listPlayers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const players = await playerService.listPlayers({
        page: parseInt(page),
        limit: parseInt(limit),
        search
      });

      res.json(players);
    } catch (error) {
      console.error('Error al listar jugadores:', error);
      res.status(500).json({
        error: 'Error interno al listar jugadores'
      });
    }
  }
}

module.exports = new PlayersController();