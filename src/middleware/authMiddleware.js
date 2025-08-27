const jwt = require('jsonwebtoken');
const { Player } = require('../models/player');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_ultra_seguro';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const player = await Player.findByPk(decoded.id);
    if (!player) {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    req.user = player;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }
    return res.status(500).json({
      error: 'Error de autenticación'
    });
  }
};

module.exports = authMiddleware;