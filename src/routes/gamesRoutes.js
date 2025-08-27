const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/gamesController');
const authMiddleware = require('../middleware/authMiddleware');
const trackingMiddleware = require('../middleware/trackingMiddleware');

// Aplicar middleware de tracking a todas las rutas
router.use(trackingMiddleware);

// Rutas públicas
router.get('/', gamesController.listGames);
router.get('/:id', gamesController.getGame);

// Rutas protegidas
router.post('/', authMiddleware, gamesController.createGame);
router.put('/:id', authMiddleware, gamesController.updateGame);
router.delete('/:id', authMiddleware, gamesController.deleteGame);
router.post('/:id/join', authMiddleware, gamesController.joinGame);
router.post('/:id/leave', authMiddleware, gamesController.leaveGame);
router.post('/:id/start', authMiddleware, gamesController.startGame);
router.get('/:id/state', authMiddleware, gamesController.getGameState);
router.get('/:id/players', authMiddleware, gamesController.getPlayersInGame);
router.get('/:id/current-player', authMiddleware, gamesController.getCurrentPlayer);
router.get('/:id/top-card', authMiddleware, gamesController.getTopCard);
router.get('/:id/scores', authMiddleware, gamesController.getGameScores);

module.exports = router;