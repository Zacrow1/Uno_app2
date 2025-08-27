const { PlayerCard } = require('../models');

class PlayerCardService {
  async createPlayerCard(playerCardData) {
    const { playerId, cardId } = playerCardData;

    return await PlayerCard.create({
      playerId,
      cardId
    });
  }

  async getPlayerCardById(id) {
    return await PlayerCard.findByPk(id, {
      include: [
        {
          model: require('../models/player').Player,
          attributes: ['id', 'username', 'email']
        },
        {
          model: require('../models/card').Card,
          attributes: ['id', 'color', 'type', 'value']
        }
      ]
    });
  }

  async updatePlayerCard(id, updateData) {
    const [updated] = await PlayerCard.update(updateData, {
      where: { id }
    });

    if (updated) {
      return await this.getPlayerCardById(id);
    }
    return null;
  }

  async deletePlayerCard(id) {
    const deleted = await PlayerCard.destroy({
      where: { id }
    });
    return deleted > 0;
  }

  async listPlayerCards(options = {}) {
    const { page = 1, limit = 10, playerId, cardId } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (playerId) where.playerId = playerId;
    if (cardId) where.cardId = cardId;

    const { count, rows } = await PlayerCard.findAndCountAll({
      where,
      include: [
        {
          model: require('../models/player').Player,
          attributes: ['id', 'username', 'email']
        },
        {
          model: require('../models/card').Card,
          attributes: ['id', 'color', 'type', 'value']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      playerCards: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  async getCardsByPlayer(playerId) {
    return await PlayerCard.findAll({
      where: { playerId },
      include: [
        {
          model: require('../models/card').Card,
          attributes: ['id', 'color', 'type', 'value']
        }
      ]
    });
  }

  async getPlayersByCard(cardId) {
    return await PlayerCard.findAll({
      where: { cardId },
      include: [
        {
          model: require('../models/player').Player,
          attributes: ['id', 'username', 'email']
        }
      ]
    });
  }
}

module.exports = new PlayerCardService();