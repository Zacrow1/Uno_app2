const { Card } = require('../models/card');
const cardService = require('../services/cardService');
const { ApiStat } = require('../models/apiStat');

class CardsController {
  async createCard(req, res) {
    try {
      const { color, type, value, gameId, playerId } = req.body;

      if (!color || !type) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: color, type'
        });
      }

      const validColors = ['red', 'blue', 'green', 'yellow', 'wild'];
      const validTypes = ['number', 'skip', 'reverse', 'draw2', 'wild', 'wild4'];

      if (!validColors.includes(color)) {
        return res.status(400).json({
          error: 'Color no válido. Debe ser: red, blue, green, yellow, wild'
        });
      }

      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: 'Tipo no válido. Debe ser: number, skip, reverse, draw2, wild, wild4'
        });
      }

      const card = await cardService.createCard({
        color,
        type,
        value,
        gameId,
        playerId
      });

      res.status(201).json({
        message: 'Tarjeta creada exitosamente',
        card
      });
    } catch (error) {
      console.error('Error al crear tarjeta:', error);
      res.status(500).json({
        error: 'Error interno al crear tarjeta'
      });
    }
  }

  async getCard(req, res) {
    try {
      const { id } = req.params;
      const card = await cardService.getCardById(id);

      if (!card) {
        return res.status(404).json({
          error: 'Tarjeta no encontrada'
        });
      }

      res.json(card);
    } catch (error) {
      console.error('Error al obtener tarjeta:', error);
      res.status(500).json({
        error: 'Error interno al obtener tarjeta'
      });
    }
  }

  async updateCard(req, res) {
    try {
      const { id } = req.params;
      const { color, type, value, gameId, playerId } = req.body;

      const validColors = ['red', 'blue', 'green', 'yellow', 'wild'];
      const validTypes = ['number', 'skip', 'reverse', 'draw2', 'wild', 'wild4'];

      if (color && !validColors.includes(color)) {
        return res.status(400).json({
          error: 'Color no válido. Debe ser: red, blue, green, yellow, wild'
        });
      }

      if (type && !validTypes.includes(type)) {
        return res.status(400).json({
          error: 'Tipo no válido. Debe ser: number, skip, reverse, draw2, wild, wild4'
        });
      }

      const card = await cardService.updateCard(id, {
        color,
        type,
        value,
        gameId,
        playerId
      });

      if (!card) {
        return res.status(404).json({
          error: 'Tarjeta no encontrada'
        });
      }

      res.json({
        message: 'Tarjeta actualizada exitosamente',
        card
      });
    } catch (error) {
      console.error('Error al actualizar tarjeta:', error);
      res.status(500).json({
        error: 'Error interno al actualizar tarjeta'
      });
    }
  }

  async deleteCard(req, res) {
    try {
      const { id } = req.params;
      const deleted = await cardService.deleteCard(id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Tarjeta no encontrada'
        });
      }

      res.json({
        message: 'Tarjeta eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar tarjeta:', error);
      res.status(500).json({
        error: 'Error interno al eliminar tarjeta'
      });
    }
  }

  async listCards(req, res) {
    try {
      const { page = 1, limit = 10, gameId, playerId, color, type } = req.query;
      const cards = await cardService.listCards({
        page: parseInt(page),
        limit: parseInt(limit),
        gameId,
        playerId,
        color,
        type
      });

      res.json(cards);
    } catch (error) {
      console.error('Error al listar tarjetas:', error);
      res.status(500).json({
        error: 'Error interno al listar tarjetas'
      });
    }
  }
}

module.exports = new CardsController();