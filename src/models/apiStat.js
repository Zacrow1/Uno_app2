const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database');

class ApiStat extends DataTypes.Model {}

ApiStat.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  endpointAccess: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requestMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  requestCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  responseTimeAvg: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  responseTimeMin: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  responseTimeMax: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'ApiStat',
  tableName: 'api_tracking',
  timestamps: true
});

module.exports = ApiStat;