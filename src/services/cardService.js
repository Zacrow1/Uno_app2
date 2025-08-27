const { Card } = require('../models');

class CardService {
  async createCard(cardData) {
    const { color, type, value, gameId, playerId } = cardData;

    return await Card.create({
      color,
      type,
      value,
      gameId,
      playerId
    });
  }

  async getCardById(id) {
    return await Card.findByPk(id, {
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

  async updateCard(id, updateData) {
    const [updated] = await Card.update(updateData, {
      where: { id }
    });

    if (updated) {
      return await this.getCardById(id);
    }
    return null;
  }

  async deleteCard(id) {
    const deleted = await Card.destroy({
      where: { id }
    });
    return deleted > 0;
  }

  async listCards(options = {}) {
    const { page = 1, limit = 10, gameId, playerId, color, type } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (gameId) where.gameId = gameId;
    if (playerId) where.playerId = playerId;
    if (color) where.color = color;
    if (type) where.type = type;

    const { count, rows } = await Card.findAndCountAll({
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
      order: [['createdAt', 'DESC']]
    });

    return {
      cards: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  async createUnoDeck() {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const numberCards = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const actionCards = ['skip', 'reverse', 'draw2'];
    const wildCards = ['wild', 'wild4'];

    const deck = [];

    // Crear cartas numéricas y de acción para cada color
    colors.forEach(color => {
      // Una carta de cada número (0-9)
      numberCards.forEach(number => {
        deck.push({ color, type: 'number', value: number });
        if (number !== '0') {
          deck.push({ color, type: 'number', value: number }); // Dos copias de cada número excepto 0
        }
      });

      // Dos copias de cada carta de acción
      actionCards.forEach(action => {
        deck.push({ color, type: action, value: action });
        deck.push({ color, type: action, value: action });
      });
    });

    // Crear cartas comodín
    for (let i = 0; i < 4; i++) {
      deck.push({ color: 'wild', type: 'wild', value: 'wild' });
      deck.push({ color: 'wild', type: 'wild4', value: 'wild4' });
    }

    return deck;
  }
}

module.exports = new CardService();