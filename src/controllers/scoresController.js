const { Score, Player, Game } = require('../models');
const scoreService = require('../services/scoreService');
const { ApiStat } = require('../models/apiStat');

class ScoresController {
  async createScore(req, res) {
    try {
      const { score, position, playerId, gameId } = req.body;

      if (!score || !position || !playerId || !gameId) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: score, position, playerId, gameId'
        });
      }

      const newScore = await scoreService.createScore({
        score,
        position,
        playerId,
        gameId
      });

      res.status(201).json({
        message: 'Score creado exitosamente',
        score: newScore
      });
    } catch (error) {
      console.error('Error al crear score:', error);
      res.status(500).json({
        error: 'Error interno al crear score'
      });
    }
  }

  async getScore(req, res) {
    try {
      const { id } = req.params;
      const score = await scoreService.getScoreById(id);

      if (!score) {
        return res.status(404).json({
          error: 'Score no encontrado'
        });
      }

      res.json(score);
    } catch (error) {
      console.error('Error al obtener score:', error);
      res.status(500).json({
        error: 'Error interno al obtener score'
      });
    }
  }

  async updateScore(req, res) {
    try {
      const { id } = req.params;
      const { score, position } = req.body;

      const updatedScore = await scoreService.updateScore(id, {
        score,
        position
      });

      if (!updatedScore) {
        return res.status(404).json({
          error: 'Score no encontrado'
        });
      }

      res.json({
        message: 'Score actualizado exitosamente',
        score: updatedScore
      });
    } catch (error) {
      console.error('Error al actualizar score:', error);
      res.status(500).json({
        error: 'Error interno al actualizar score'
      });
    }
  }

  async deleteScore(req, res) {
    try {
      const { id } = req.params;
      const deleted = await scoreService.deleteScore(id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Score no encontrado'
        });
      }

      res.json({
        message: 'Score eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar score:', error);
      res.status(500).json({
        error: 'Error interno al eliminar score'
      });
    }
  }

  async listScores(req, res) {
    try {
      const { page = 1, limit = 10, gameId, playerId } = req.query;
      const scores = await scoreService.listScores({
        page: parseInt(page),
        limit: parseInt(limit),
        gameId,
        playerId
      });

      res.json(scores);
    } catch (error) {
      console.error('Error al listar scores:', error);
      res.status(500).json({
        error: 'Error interno al listar scores'
      });
    }
  }
}

module.exports = new ScoresController();