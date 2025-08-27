// ===== MÓDULO DE GESTIÓN DE PUNTUACIONES =====
const Scores = {
    // Estado del módulo
    scores: [],
    loading: false,
    
    // Inicializar módulo
    init() {
        this.setupEventListeners();
        this.loadScores();
    },
    
    // Configurar event listeners
    setupEventListeners() {
        // Filtro de puntuaciones
        const scoreFilter = document.getElementById('score-filter');
        if (scoreFilter) {
            scoreFilter.addEventListener('change', (e) => this.filterScores(e.target.value));
        }
    },
    
    // Cargar lista de puntuaciones
    async loadScores() {
        try {
            this.loading = true;
            this.showLoading(true);
            
            const response = await API.getScores();
            this.scores = response.data || response;
            
            this.renderScores();
            
        } catch (error) {
            console.error('Error loading scores:', error);
            UI.showNotification('Error al cargar las puntuaciones', 'error');
        } finally {
            this.loading = false;
            this.showLoading(false);
        }
    },
    
    // Renderizar lista de puntuaciones
    renderScores() {
        const scoresList = document.getElementById('scores-list');
        if (!scoresList) return;
        
        if (this.scores.length === 0) {
            scoresList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <h3>No hay puntuaciones registradas</h3>
                    <p>Juega algunas partidas para aparecer en la tabla de puntuaciones</p>
                </div>
            `;
            return;
        }
        
        scoresList.innerHTML = this.createScoresTable();
        
        // Agregar event listeners
        this.attachScoreListeners();
    },
    
    // Crear tabla de puntuaciones
    createScoresTable() {
        const sortedScores = [...this.scores].sort((a, b) => {
            // Ordenar por puntuación (descendente) y luego por posición (ascendente)
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return (a.position || 999) - (b.position || 999);
        });
        
        return `
            <div class="scores-table-container">
                <table class="scores-table">
                    <thead>
                        <tr>
                            <th>Posición</th>
                            <th>Jugador</th>
                            <th>Puntuación</th>
                            <th>Juego</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedScores.map((score, index) => this.createScoreRow(score, index)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // Crear fila de puntuación
    createScoreRow(score, index) {
        const position = score.position || (index + 1);
        const positionClass = this.getPositionClass(position);
        const medalIcon = this.getMedalIcon(position);
        
        return `
            <tr class="score-row" data-score-id="${score.id}">
                <td class="position-cell">
                    <span class="position-badge ${positionClass}">
                        ${medalIcon} ${position}
                    </span>
                </td>
                <td class="player-cell">
                    <div class="player-info">
                        <span class="player-name">${score.playerName || score.player?.name || 'Jugador'}</span>
                        ${score.player?.email ? `<small class="player-email">${score.player.email}</small>` : ''}
                    </div>
                </td>
                <td class="score-cell">
                    <span class="score-value">${score.score}</span>
                </td>
                <td class="game-cell">
                    <span class="game-name">${score.gameName || score.game?.name || `Juego #${score.gameId}`}</span>
                </td>
                <td class="date-cell">
                    <span class="score-date">${this.formatDate(score.createdAt)}</span>
                </td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-primary" onclick="Scores.showScoreDetails(${score.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    },
    
    // Obtener clase CSS para posición
    getPositionClass(position) {
        if (position === 1) return 'position-first';
        if (position === 2) return 'position-second';
        if (position === 3) return 'position-third';
        return 'position-other';
    },
    
    // Obtener ícono de medalla
    getMedalIcon(position) {
        if (position === 1) return '<i class="fas fa-trophy"></i>';
        if (position === 2) return '<i class="fas fa-medal"></i>';
        if (position === 3) return '<i class="fas fa-award"></i>';
        return '';
    },
    
    // Agregar event listeners a la tabla de puntuaciones
    attachScoreListeners() {
        // Los listeners se agregan mediante onclick en el HTML
    },
    
    // Mostrar detalles de puntuación
    async showScoreDetails(scoreId) {
        try {
            this.showLoading(true);
            
            const score = await API.getScore(scoreId);
            
            this.showScoreDetailsModal(score);
            
        } catch (error) {
            console.error('Error loading score details:', error);
            UI.showNotification('Error al cargar los detalles de la puntuación', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Mostrar modal con detalles de puntuación
    showScoreDetailsModal(score) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalles de Puntuación</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="score-details">
                        <div class="score-detail-grid">
                            <div class="detail-item">
                                <label>ID:</label>
                                <span>${score.id}</span>
                            </div>
                            <div class="detail-item">
                                <label>Posición:</label>
                                <span class="position-badge ${this.getPositionClass(score.position || 0)}">
                                    ${this.getMedalIcon(score.position || 0)} ${score.position || 'N/A'}
                                </span>
                            </div>
                            <div class="detail-item">
                                <label>Puntuación:</label>
                                <span class="score-value-large">${score.score}</span>
                            </div>
                            <div class="detail-item">
                                <label>Jugador:</label>
                                <span>${score.playerName || score.player?.name || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Juego:</label>
                                <span>${score.gameName || score.game?.name || `Juego #${score.gameId}`}</span>
                            </div>
                            <div class="detail-item">
                                <label>Fecha:</label>
                                <span>${this.formatDate(score.createdAt)}</span>
                            </div>
                        </div>
                        
                        ${score.game ? `
                        <div class="game-info-section">
                            <h4>Información del Juego</h4>
                            <div class="game-info-grid">
                                <div class="info-item">
                                    <strong>Estado:</strong>
                                    <span class="game-status ${Games.getStatusClass(score.game.status)}">
                                        ${Games.getStatusText(score.game.status)}
                                    </span>
                                </div>
                                <div class="info-item">
                                    <strong>Jugadores:</strong>
                                    <span>${score.game.players ? score.game.players.length : 0}/${score.game.maxPlayers || 4}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Creador:</strong>
                                    <span>${score.game.creatorName || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Fecha de Creación:</strong>
                                    <span>${this.formatDate(score.game.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        
                        ${score.player ? `
                        <div class="player-info-section">
                            <h4>Información del Jugador</h4>
                            <div class="player-info-grid">
                                <div class="info-item">
                                    <strong>Email:</strong>
                                    <span>${score.player.email || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Fecha de Registro:</strong>
                                    <span>${this.formatDate(score.player.createdAt)}</span>
                                </div>
                                ${score.player.totalGames !== undefined ? `
                                <div class="info-item">
                                    <strong>Total de Partidas:</strong>
                                    <span>${score.player.totalGames}</span>
                                </div>
                                ` : ''}
                                ${score.player.totalScore !== undefined ? `
                                <div class="info-item">
                                    <strong>Puntuación Total:</strong>
                                    <span>${score.player.totalScore}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },
    
    // Filtrar puntuaciones
    filterScores(filterType) {
        const scoreRows = document.querySelectorAll('.score-row');
        
        if (!filterType) {
            // Mostrar todas las puntuaciones
            scoreRows.forEach(row => row.style.display = '');
            return;
        }
        
        switch (filterType) {
            case 'top10':
                // Mostrar solo las primeras 10 puntuaciones
                scoreRows.forEach((row, index) => {
                    row.style.display = index < 10 ? '' : 'none';
                });
                break;
                
            case 'recent':
                // Mostrar puntuaciones más recientes (últimos 7 días)
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                
                scoreRows.forEach(row => {
                    const dateCell = row.querySelector('.score-date');
                    const dateText = dateCell.textContent;
                    const scoreDate = new Date(dateText);
                    row.style.display = scoreDate >= sevenDaysAgo ? '' : 'none';
                });
                break;
        }
    },
    
    // Formatear fecha
    formatDate(dateString) {
        if (!dateString) return 'No disponible';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Mostrar indicador de carga
    showLoading(show) {
        const scoresList = document.getElementById('scores-list');
        if (scoresList) {
            if (show) {
                scoresList.innerHTML = `
                    <div class="loading-container">
                        <div class="loading"></div>
                        <p>Cargando puntuaciones...</p>
                    </div>
                `;
            }
        }
    },
    
    // Obtener estadísticas de puntuaciones
    getScoreStats() {
        if (this.scores.length === 0) {
            return {
                total: 0,
                average: 0,
                highest: 0,
                lowest: 0,
                totalGames: 0
            };
        }
        
        const scores = this.scores.map(s => s.score);
        const total = scores.reduce((sum, score) => sum + score, 0);
        const average = total / scores.length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);
        const uniqueGames = new Set(this.scores.map(s => s.gameId)).size;
        
        return {
            total: this.scores.length,
            average: Math.round(average),
            highest,
            lowest,
            totalGames: uniqueGames
        };
    },
    
    // Obtener tabla de líderes
    getLeaderboard(limit = 10) {
        const playerScores = {};
        
        // Agrupar puntuaciones por jugador
        this.scores.forEach(score => {
            const playerId = score.playerId;
            const playerName = score.playerName || score.player?.name || 'Jugador';
            
            if (!playerScores[playerId]) {
                playerScores[playerId] = {
                    id: playerId,
                    name: playerName,
                    scores: [],
                    totalScore: 0,
                    gamesPlayed: 0,
                    averageScore: 0,
                    highestScore: 0
                };
            }
            
            playerScores[playerId].scores.push(score.score);
            playerScores[playerId].totalScore += score.score;
            playerScores[playerId].gamesPlayed++;
            playerScores[playerId].highestScore = Math.max(playerScores[playerId].highestScore, score.score);
        });
        
        // Calcular promedios y ordenar
        const leaderboard = Object.values(playerScores)
            .map(player => ({
                ...player,
                averageScore: Math.round(player.totalScore / player.gamesPlayed)
            }))
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, limit);
        
        return leaderboard;
    }
};

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Scores.init();
});

// Exportar para uso global
window.Scores = Scores;