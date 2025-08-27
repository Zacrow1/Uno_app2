const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cardsController');
const authMiddleware = require('../middleware/authMiddleware');
const trackingMiddleware = require('../middleware/trackingMiddleware');

// Aplicar middleware de tracking a todas las rutas
router.use(trackingMiddleware);

// Rutas públicas
router.get('/', cardsController.listCards);
router.get('/:id', cardsController.getCard);

// Rutas protegidas
router.post('/', authMiddleware, cardsController.createCard);
router.put('/:id', authMiddleware, cardsController.updateCard);
router.delete('/:id', authMiddleware, cardsController.deleteCard);

module.exports = router;