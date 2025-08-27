const { PlayerCard } = require('../models/playerCard');
const playerCardService = require('../services/playerCardService');
const { ApiStat } = require('../models/apiStat');

class PlayerCardController {
  async createPlayerCard(req, res) {
    try {
      const { playerId, cardId } = req.body;

      if (!playerId || !cardId) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: playerId, cardId'
        });
      }

      const playerCard = await playerCardService.createPlayerCard({
        playerId,
        cardId
      });

      res.status(201).json({
        message: 'Relación jugador-tarjeta creada exitosamente',
        playerCard
      });
    } catch (error) {
      console.error('Error al crear relación jugador-tarjeta:', error);
      res.status(500).json({
        error: 'Error interno al crear relación jugador-tarjeta'
      });
    }
  }

  async getPlayerCard(req, res) {
    try {
      const { id } = req.params;
      const playerCard = await playerCardService.getPlayerCardById(id);

      if (!playerCard) {
        return res.status(404).json({
          error: 'Relación jugador-tarjeta no encontrada'
        });
      }

      res.json(playerCard);
    } catch (error) {
      console.error('Error al obtener relación jugador-tarjeta:', error);
      res.status(500).json({
        error: 'Error interno al obtener relación jugador-tarjeta'
      });
    }
  }

  async updatePlayerCard(req, res) {
    try {
      const { id } = req.params;
      const { playerId, cardId } = req.body;

      const playerCard = await playerCardService.updatePlayerCard(id, {
        playerId,
        cardId
      });

      if (!playerCard) {
        return res.status(404).json({
          error: 'Relación jugador-tarjeta no encontrada'
        });
      }

      res.json({
        message: 'Relación jugador-tarjeta actualizada exitosamente',
        playerCard
      });
    } catch (error) {
      console.error('Error al actualizar relación jugador-tarjeta:', error);
      res.status(500).json({
        error: 'Error interno al actualizar relación jugador-tarjeta'
      });
    }
  }

  async deletePlayerCard(req, res) {
    try {
      const { id } = req.params;
      const deleted = await playerCardService.deletePlayerCard(id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Relación jugador-tarjeta no encontrada'
        });
      }

      res.json({
        message: 'Relación jugador-tarjeta eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar relación jugador-tarjeta:', error);
      res.status(500).json({
        error: 'Error interno al eliminar relación jugador-tarjeta'
      });
    }
  }

  async listPlayerCards(req, res) {
    try {
      const { page = 1, limit = 10, playerId, cardId } = req.query;
      const playerCards = await playerCardService.listPlayerCards({
        page: parseInt(page),
        limit: parseInt(limit),
        playerId,
        cardId
      });

      res.json(playerCards);
    } catch (error) {
      console.error('Error al listar relaciones jugador-tarjeta:', error);
      res.status(500).json({
        error: 'Error interno al listar relaciones jugador-tarjeta'
      });
    }
  }
}

module.exports = new PlayerCardController();