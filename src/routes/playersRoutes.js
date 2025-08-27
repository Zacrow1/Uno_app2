const express = require('express');
const router = express.Router();
const playersController = require('../controllers/playersController');
const authMiddleware = require('../middleware/authMiddleware');
const trackingMiddleware = require('../middleware/trackingMiddleware');

// Aplicar middleware de tracking a todas las rutas
router.use(trackingMiddleware);

// Rutas públicas
router.post('/', playersController.createPlayer);
router.get('/', playersController.listPlayers);

// Rutas protegidas
router.get('/:id', authMiddleware, playersController.getPlayer);
router.put('/:id', authMiddleware, playersController.updatePlayer);
router.delete('/:id', authMiddleware, playersController.deletePlayer);

module.exports = router;