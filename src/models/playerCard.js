const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database');

class PlayerCard extends DataTypes.Model {}

PlayerCard.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  playerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'PlayerCard',
  tableName: 'player_cards',
  timestamps: true
});

module.exports = PlayerCard;