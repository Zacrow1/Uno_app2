import express from 'express';
import playersController from '../controllers/playersController.js';
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth routes (specific routes first)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/profile', authMiddleware, authController.profile);

// Player routes (dynamic routes last)
router.post('/', playersController.createPlayer);
router.get('/:id', authMiddleware, playersController.getPlayer);
router.put('/:id', authMiddleware, playersController.updatePlayer);
router.delete('/:id', authMiddleware, playersController.deletePlayer);
router.get('/', authMiddleware, playersController.listPlayers);

export default router;