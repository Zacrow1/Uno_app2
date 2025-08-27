const { Player } = require('../models');
const bcrypt = require('bcrypt');

class PlayerService {
  async createPlayer(playerData) {
    const { username, email, password } = playerData;

    const hashedPassword = await bcrypt.hash(password, 10);

    return await Player.create({
      username,
      email,
      password: hashedPassword
    });
  }

  async getPlayerById(id) {
    return await Player.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  }

  async updatePlayer(id, updateData) {
    const [updated] = await Player.update(updateData, {
      where: { id }
    });

    if (updated) {
      return await this.getPlayerById(id);
    }
    return null;
  }

  async deletePlayer(id) {
    const deleted = await Player.destroy({
      where: { id }
    });
    return deleted > 0;
  }

  async listPlayers(options = {}) {
    const { page = 1, limit = 10, search } = options;
    const offset = (page - 1) * limit;

    const where = search ? {
      $or: [
        { username: { $like: `%${search}%` } },
        { email: { $like: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await Player.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      players: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  async findByEmail(email) {
    return await Player.findOne({
      where: { email }
    });
  }

  async verifyPassword(player, password) {
    return await bcrypt.compare(password, player.password);
  }
}

module.exports = new PlayerService();