const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const trackingMiddleware = require('../middleware/trackingMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Aplicar middleware de tracking a todas las rutas
router.use(trackingMiddleware);

// Rutas de estadísticas con caché
router.get('/requests', cacheMiddleware(), statsController.getRequests);
router.get('/response-times', cacheMiddleware(), statsController.getResponseTimes);
router.get('/status-codes', cacheMiddleware(), statsController.getStatusCodes);
router.get('/popular-endpoints', cacheMiddleware(), statsController.getPopularEndpoints);

module.exports = router;