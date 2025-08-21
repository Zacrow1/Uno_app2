import { Router } from "express";
import gamesController from "../controllers/gamesController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Rutas básicas de juegos
router.post("/", authMiddleware, gamesController.createGame);
router.get("/:id", gamesController.getGameById);
router.put("/:id", authMiddleware, gamesController.updateGame);
router.delete("/:id", authMiddleware, gamesController.deleteGame);
router.get("/", gamesController.listGames);

// Rutas de gestión de jugadores
router.post("/:gameId/players", authMiddleware, gamesController.addPlayerToGame);
router.get("/:gameId/players", gamesController.getPlayersInGame);
router.delete("/:gameId/players", authMiddleware, gamesController.removePlayerFromGame);

// Rutas de control de juego
router.post("/:gameId/start", authMiddleware, gamesController.startGame);
router.post("/:gameId/finish", authMiddleware, gamesController.finishGame);
router.post("/:gameId/end", authMiddleware, gamesController.endGame);

// Week6 - 13 Funcionalidades del Juego UNO

// 1. Distribución de Cartas a los Jugadores
router.post("/:gameId/deal-cards", authMiddleware, gamesController.dealCardsToPlayers);

// 2. Reglas para Jugar una Carta
router.post("/:gameId/play-card", authMiddleware, gamesController.playCardWithRules);

// 3. Robar Carta cuando no se puede Jugar
router.post("/:gameId/draw-card", authMiddleware, gamesController.drawCardForPlayer);

// 4. Sistema UNO y Monitoreo
router.post("/:gameId/say-uno", authMiddleware, gamesController.sayUno);

// 5. Desafío por no decir UNO
router.post("/:gameId/challenge-uno", authMiddleware, gamesController.challengeUno);

// 6. Finalización de Turno
router.post("/:gameId/end-turn", authMiddleware, gamesController.endPlayerTurn);

// 7. Detección de Fin de Juego
router.get("/:gameId/check-end", gamesController.checkGameEnd);

// 8. Consulta de Estado del Juego
router.get("/:gameId/status", gamesController.getGameStatus);

// 9. Historial de Movimientos
router.get("/:gameId/history", gamesController.getMoveHistory);

// 10. Visualización de Cartas Propias
router.get("/:gameId/my-cards", authMiddleware, gamesController.getPlayerCards);

// 11. Puntajes de Jugadores
router.get("/:gameId/scores", gamesController.getPlayerScores);

// 12. Soporte Multijugador
router.post("/:gameId/multiplayer", authMiddleware, gamesController.handleMultiplayer);

// 13. Registro de Errores
router.post("/:gameId/log-error", authMiddleware, gamesController.logGameError);

// Week7 - Funcionalidades Avanzadas

// 1. Jugar carta de salto (Skip)
router.post("/:gameId/play-skip-card", authMiddleware, gamesController.playSkipCard);

// 2. Jugar carta de reversa (Reverse)
router.post("/:gameId/play-reverse-card", authMiddleware, gamesController.playReverseCard);

// 3. Robar hasta tener carta jugable
router.post("/:gameId/draw-until-playable", authMiddleware, gamesController.drawUntilPlayable);

export default router;