const express = require('express');
const router = express.Router();
const scoresController = require('../controllers/scoresController');
const authMiddleware = require('../middleware/authMiddleware');
const trackingMiddleware = require('../middleware/trackingMiddleware');

// Aplicar middleware de tracking a todas las rutas
router.use(trackingMiddleware);

// Rutas públicas
router.get('/', scoresController.listScores);
router.get('/:id', scoresController.getScore);

// Rutas protegidas
router.post('/', authMiddleware, scoresController.createScore);
router.put('/:id', authMiddleware, scoresController.updateScore);
router.delete('/:id', authMiddleware, scoresController.deleteScore);

module.exports = router;