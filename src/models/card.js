const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database');

class Card extends DataTypes.Model {}

Card.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  color: {
    type: DataTypes.ENUM('red', 'blue', 'green', 'yellow', 'wild'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('number', 'skip', 'reverse', 'draw2', 'wild', 'wild4'),
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  playerId: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  modelName: 'Card',
  tableName: 'cards',
  timestamps: true
});

module.exports = Card;