const { sequelize } = require('./database');
const { Player } = require('../models/player');
const { Game } = require('../models/game');
const { Score } = require('../models/score');
const { Card } = require('../models/card');
const { ApiStat } = require('../models/apiStat');
const { PlayerCard } = require('../models/playerCard');

// Definir relaciones entre modelos
const defineRelationships = () => {
  // Player - Game (creator)
  Player.hasMany(Game, { foreignKey: 'creatorId', as: 'createdGames' });
  Game.belongsTo(Player, { foreignKey: 'creatorId', as: 'creator' });

  // Player - Game (players in game)
  Game.belongsToMany(Player, { 
    through: 'game_players',
    as: 'players',
    foreignKey: 'gameId',
    otherKey: 'playerId'
  });
  Player.belongsToMany(Game, { 
    through: 'game_players',
    as: 'games',
    foreignKey: 'playerId',
    otherKey: 'gameId'
  });

  // Player - Score
  Player.hasMany(Score, { foreignKey: 'playerId' });
  Score.belongsTo(Player, { foreignKey: 'playerId' });

  // Game - Score
  Game.hasMany(Score, { foreignKey: 'gameId' });
  Score.belongsTo(Game, { foreignKey: 'gameId' });

  // Game - Card
  Game.hasMany(Card, { foreignKey: 'gameId' });
  Card.belongsTo(Game, { foreignKey: 'gameId' });

  // Player - Card
  Player.hasMany(Card, { foreignKey: 'playerId' });
  Card.belongsTo(Player, { foreignKey: 'playerId' });

  // Player - PlayerCard
  Player.hasMany(PlayerCard, { foreignKey: 'playerId' });
  PlayerCard.belongsTo(Player, { foreignKey: 'playerId' });

  // Card - PlayerCard
  Card.hasMany(PlayerCard, { foreignKey: 'cardId' });
  PlayerCard.belongsTo(Card, { foreignKey: 'cardId' });
};

// Inicializar base de datos
const initializeDatabase = async () => {
  try {
    // Definir relaciones
    defineRelationships();

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ force: false });
    
    console.log('Base de datos sincronizada correctamente.');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

module.exports = {
  initializeDatabase,
  defineRelationships
};