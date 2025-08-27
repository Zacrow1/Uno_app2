const { Score } = require('../models');

class ScoreService {
  async createScore(scoreData) {
    const { score, position, playerId, gameId } = scoreData;

    return await Score.create({
      score,
      position,
      playerId,
      gameId
    });
  }

  async getScoreById(id) {
    return await Score.findByPk(id, {
      include: [
        {
          model: require('../models/player').Player,
          attributes: ['id', 'username', 'email']
        },
        {
          model: require('../models/game').Game,
          attributes: ['id', 'name', 'status']
        }
      ]
    });
  }

  async updateScore(id, updateData) {
    const [updated] = await Score.update(updateData, {
      where: { id }
    });

    if (updated) {
      return await this.getScoreById(id);
    }
    return null;
  }

  async deleteScore(id) {
    const deleted = await Score.destroy({
      where: { id }
    });
    return deleted > 0;
  }

  async listScores(options = {}) {
    const { page = 1, limit = 10, gameId, playerId } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (gameId) where.gameId = gameId;
    if (playerId) where.playerId = playerId;

    const { count, rows } = await Score.findAndCountAll({
      where,
      include: [
        {
          model: require('../models/player').Player,
          attributes: ['id', 'username', 'email']
        },
        {
          model: require('../models/game').Game,
          attributes: ['id', 'name', 'status']
        }
      ],
      limit,
      offset,
      order: [['position', 'ASC'], ['score', 'DESC']]
    });

    return {
      scores: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }
}

module.exports = new ScoreService();