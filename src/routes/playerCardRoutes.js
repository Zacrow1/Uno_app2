const express = require('express');
const router = express.Router();
const playerCardController = require('../controllers/playerCardController');
const authMiddleware = require('../middleware/authMiddleware');
const trackingMiddleware = require('../middleware/trackingMiddleware');

// Aplicar middleware de tracking a todas las rutas
router.use(trackingMiddleware);

// Rutas públicas
router.get('/', playerCardController.listPlayerCards);
router.get('/:id', playerCardController.getPlayerCard);

// Rutas protegidas
router.post('/', authMiddleware, playerCardController.createPlayerCard);
router.put('/:id', authMiddleware, playerCardController.updatePlayerCard);
router.delete('/:id', authMiddleware, playerCardController.deletePlayerCard);

module.exports = router;