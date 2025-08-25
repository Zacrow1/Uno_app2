import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

import CardModel from '../models/card.js';
import GameModel from '../models/game.js';
import PlayerModel from '../models/player.js';
import PlayerCardModel from '../models/playerCard.js';
import ScoreModel from '../models/score.js';

dotenv.config();

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_NAME || 'uno_game.sqlite',
  logging: false
});

const Player = PlayerModel(sequelize, Sequelize.DataTypes);
const Game = GameModel(sequelize, Sequelize.DataTypes);
const Card = CardModel(sequelize, Sequelize.DataTypes);
const Score = ScoreModel(sequelize, Sequelize.DataTypes);
const PlayerCard = PlayerCardModel(sequelize, Sequelize.DataTypes);

// Relaciones existentes
Player.belongsToMany(Game, { through: 'GamePlayers' });
Game.belongsToMany(Player, { through: 'GamePlayers' });

// Relaciones para PlayerCard
Player.hasMany(PlayerCard, { foreignKey: 'playerId' });
Game.hasMany(PlayerCard, { foreignKey: 'gameId' });
Card.hasMany(PlayerCard, { foreignKey: 'cardId' });

PlayerCard.belongsTo(Player, { foreignKey: 'playerId' });
PlayerCard.belongsTo(Game, { foreignKey: 'gameId' });
PlayerCard.belongsTo(Card, { foreignKey: 'cardId' });

export { Card, Game, Player, PlayerCard, Score, sequelize };

