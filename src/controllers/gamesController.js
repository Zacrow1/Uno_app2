import gameService from "../services/gameService.js";
import playerCardService from "../services/playerCardService.js";
import cardService from "../services/cardService.js";

// Crear un nuevo juego
const createGame = async (req, res) => {
  try {
    const game = await gameService.createGame(req.body);
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener juego por ID
const getGameById = async (req, res) => {
  try {
    const game = await gameService.getGameById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar juego
const updateGame = async (req, res) => {
  try {
    const game = await gameService.updateGame(req.params.id, req.body);
    if (!game) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar juego
const deleteGame = async (req, res) => {
  try {
    const result = await gameService.deleteGame(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }
    res.json({ message: "Juego eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todos los juegos
const listGames = async (req, res) => {
  try {
    const games = await gameService.listGames();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Agregar jugador a un juego
const addPlayerToGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId } = req.body;
    
    const result = await gameService.addPlayerToGame(gameId, playerId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "already_joined") {
      return res.status(400).json({ error: "El jugador ya está en el juego" });
    }
    
    res.json({ message: "Jugador agregado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener jugadores de un juego
const getPlayersInGame = async (req, res) => {
  try {
    const players = await gameService.getPlayersInGame(req.params.gameId);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Iniciar juego
const startGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id; // Asumiendo que el middleware de auth añade el usuario
    
    const result = await gameService.startGame(gameId, userId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "not_creator") {
      return res.status(403).json({ error: "Solo el creador puede iniciar el juego" });
    } else if (result === "no_players") {
      return res.status(400).json({ error: "No hay jugadores en el juego" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Finalizar juego
const finishGame = async (req, res) => {
  try {
    const game = await gameService.finishGame(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remover jugador de un juego
const removePlayerFromGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId } = req.body;
    
    const result = await gameService.removePlayerFromGame(gameId, playerId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "not_in_game") {
      return res.status(400).json({ error: "El jugador no está en el juego" });
    }
    
    res.json({ message: "Jugador removido exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Finalizar juego (solo creador)
const endGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    
    const result = await gameService.endGame(gameId, userId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "not_creator") {
      return res.status(403).json({ error: "Solo el creador puede finalizar el juego" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 1. Distribución de Cartas a los Jugadores
const dealCardsToPlayers = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    
    const result = await gameService.dealCardsToPlayers(gameId, userId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "not_creator") {
      return res.status(403).json({ error: "Solo el creador puede repartir cartas" });
    } else if (result === "game_not_started") {
      return res.status(400).json({ error: "El juego no ha iniciado" });
    } else if (result === "no_players") {
      return res.status(400).json({ error: "No hay jugadores en el juego" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Reglas para Jugar una Carta
const playCardWithRules = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    const { cardId, color } = req.body;
    
    const result = await gameService.playCardWithRules(gameId, userId, cardId, color);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "not_player_turn") {
      return res.status(400).json({ error: "No es tu turno" });
    } else if (result === "card_not_found") {
      return res.status(404).json({ error: "Carta no encontrada" });
    } else if (result === "invalid_card") {
      return res.status(400).json({ error: "Movimiento inválido según reglas UNO" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Robar Carta cuando no se puede Jugar
const drawCardForPlayer = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    
    const result = await gameService.drawCardForPlayer(gameId, userId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "game_not_started") {
      return res.status(400).json({ error: "El juego no ha iniciado" });
    } else if (result === "not_player_turn") {
      return res.status(400).json({ error: "No es tu turno" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Sistema UNO y Monitoreo
const sayUno = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    
    const result = await gameService.sayUno(gameId, userId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "player_not_found") {
      return res.status(404).json({ error: "Jugador no encontrado" });
    } else if (result === "invalid_uno_state") {
      return res.status(400).json({ error: "No tienes exactamente una carta" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Desafío por no decir UNO
const challengeUno = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    const { challengedPlayerId } = req.body;
    
    const result = await gameService.challengeUno(gameId, userId, challengedPlayerId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "player_not_found") {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Finalización de Turno
const endPlayerTurn = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    
    const result = await gameService.endPlayerTurn(gameId, userId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "not_player_turn") {
      return res.status(400).json({ error: "No es tu turno" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Detección de Fin de Juego
const checkGameEnd = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const result = await gameService.checkGameEnd(gameId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 8. Consulta de Estado del Juego
const getGameStatus = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const result = await gameService.getGameStatus(gameId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 9. Historial de Movimientos
const getMoveHistory = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const result = await gameService.getMoveHistory(gameId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 10. Visualización de Cartas Propias
const getPlayerCards = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    
    const result = await gameService.getPlayerCards(gameId, userId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "player_not_in_game") {
      return res.status(400).json({ error: "No estás en este juego" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 11. Puntajes de Jugadores
const getPlayerScores = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const result = await gameService.getPlayerScores(gameId);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 12. Soporte Multijugador
const handleMultiplayer = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    const { action } = req.body;
    
    const result = await gameService.handleMultiplayer(gameId, userId, action);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    } else if (result === "invalid_action") {
      return res.status(400).json({ error: "Acción inválida" });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 13. Registro de Errores
const logGameError = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;
    const { error, context } = req.body;
    
    const result = await gameService.logGameError(gameId, userId, error, context);
    
    if (result === null) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }
    
    res.json({ log_id: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createGame,
  getGameById,
  updateGame,
  deleteGame,
  listGames,
  addPlayerToGame,
  getPlayersInGame,
  startGame,
  finishGame,
  removePlayerFromGame,
  endGame,
  dealCardsToPlayers,
  playCardWithRules,
  drawCardForPlayer,
  sayUno,
  challengeUno,
  endPlayerTurn,
  checkGameEnd,
  getGameStatus,
  getMoveHistory,
  getPlayerCards,
  getPlayerScores,
  handleMultiplayer,
  logGameError
};