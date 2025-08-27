const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database');

class Game extends DataTypes.Model {}

Game.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4
  },
  status: {
    type: DataTypes.ENUM('waiting', 'playing', 'finished'),
    defaultValue: 'waiting'
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currentPlayer: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  topCard: {
    type: DataTypes.JSON,
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
  modelName: 'Game',
  tableName: 'games',
  timestamps: true
});

module.exports = Game;