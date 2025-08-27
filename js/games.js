// ===== MÓDULO DE GESTIÓN DE JUEGOS =====
const Games = {
    // Estado del módulo
    games: [],
    currentGame: null,
    loading: false,
    
    // Inicializar módulo
    init() {
        this.setupEventListeners();
        this.loadGames();
    },
    
    // Configurar event listeners
    setupEventListeners() {
        // Búsqueda de juegos
        const gameSearch = document.getElementById('game-search');
        if (gameSearch) {
            gameSearch.addEventListener('input', (e) => this.filterGames(e.target.value));
        }
        
        // Filtro por estado
        const gameStatus = document.getElementById('game-status');
        if (gameStatus) {
            gameStatus.addEventListener('change', (e) => this.filterGamesByStatus(e.target.value));
        }
        
        // Formulario de crear juego
        const createGameForm = document.getElementById('create-game-form');
        if (createGameForm) {
            createGameForm.addEventListener('submit', (e) => this.handleCreateGame(e));
        }
    },
    
    // Cargar lista de juegos
    async loadGames() {
        try {
            this.loading = true;
            this.showLoading(true);
            
            const response = await API.getGames();
            this.games = response.data || response;
            
            this.renderGames();
            
        } catch (error) {
            console.error('Error loading games:', error);
            UI.showNotification('Error al cargar los juegos', 'error');
        } finally {
            this.loading = false;
            this.showLoading(false);
        }
    },
    
    // Renderizar lista de juegos
    renderGames() {
        const gamesList = document.getElementById('games-list');
        if (!gamesList) return;
        
        if (this.games.length === 0) {
            gamesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-gamepad"></i>
                    <h3>No hay juegos disponibles</h3>
                    <p>Crea un nuevo juego para empezar a jugar</p>
                    <button class="btn btn-primary" onclick="showCreateGameModal()">
                        <i class="fas fa-plus"></i>
                        Crear Juego
                    </button>
                </div>
            `;
            return;
        }
        
        gamesList.innerHTML = this.games.map(game => this.createGameCard(game)).join('');
        
        // Agregar event listeners a las tarjetas
        this.attachGameCardListeners();
    },
    
    // Crear tarjeta de juego
    createGameCard(game) {
        const statusClass = this.getStatusClass(game.status);
        const statusText = this.getStatusText(game.status);
        const playerCount = game.players ? game.players.length : 0;
        const maxPlayers = game.maxPlayers || 4;
        
        return `
            <div class="game-card" data-game-id="${game.id}">
                <h3>
                    <i class="fas fa-gamepad"></i>
                    ${game.name || `Juego #${game.id}`}
                </h3>
                <div class="game-info">
                    <p><strong>Estado:</strong> <span class="game-status ${statusClass}">${statusText}</span></p>
                    <p><strong>Jugadores:</strong> ${playerCount}/${maxPlayers}</p>
                    <p><strong>Creador:</strong> ${game.creatorName || 'Desconocido'}</p>
                    <p><strong>Creado:</strong> ${this.formatDate(game.createdAt)}</p>
                </div>
                <div class="game-actions">
                    <button class="btn btn-primary" onclick="Games.showGameDetails(${game.id})">
                        <i class="fas fa-eye"></i>
                        Ver Detalles
                    </button>
                    ${this.getGameActionButtons(game)}
                </div>
            </div>
        `;
    },
    
    // Obtener clase CSS para estado del juego
    getStatusClass(status) {
        const statusClasses = {
            'waiting': 'status-waiting',
            'playing': 'status-playing',
            'finished': 'status-finished'
        };
        return statusClasses[status] || 'status-waiting';
    },
    
    // Obtener texto para estado del juego
    getStatusText(status) {
        const statusTexts = {
            'waiting': 'Esperando',
            'playing': 'Jugando',
            'finished': 'Finalizado'
        };
        return statusTexts[status] || 'Desconocido';
    },
    
    // Obtener botones de acción según estado del juego
    getGameActionButtons(game) {
        const user = Auth.getCurrentUser();
        if (!user) return '';
        
        const isCreator = game.creatorId === user.id;
        const isPlayer = game.players && game.players.some(p => p.id === user.id);
        const canJoin = game.status === 'waiting' && !isPlayer && (game.players ? game.players.length < game.maxPlayers : true);
        const canStart = game.status === 'waiting' && isCreator && game.players && game.players.length >= 2;
        const canLeave = game.status === 'waiting' && isPlayer;
        
        let buttons = '';
        
        if (canJoin) {
            buttons += `
                <button class="btn btn-success" onclick="Games.joinGame(${game.id})">
                    <i class="fas fa-sign-in-alt"></i>
                    Unirse
                </button>
            `;
        }
        
        if (canStart) {
            buttons += `
                <button class="btn btn-primary" onclick="Games.startGame(${game.id})">
                    <i class="fas fa-play"></i>
                    Iniciar
                </button>
            `;
        }
        
        if (canLeave) {
            buttons += `
                <button class="btn btn-warning" onclick="Games.leaveGame(${game.id})">
                    <i class="fas fa-sign-out-alt"></i>
                    Abandonar
                </button>
            `;
        }
        
        if (isCreator && game.status !== 'finished') {
            buttons += `
                <button class="btn btn-danger" onclick="Games.deleteGame(${game.id})">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
            `;
        }
        
        return buttons;
    },
    
    // Agregar event listeners a las tarjetas de juego
    attachGameCardListeners() {
        // Los listeners se agregan mediante onclick en el HTML
    },
    
    // Mostrar detalles del juego
    async showGameDetails(gameId) {
        try {
            this.showLoading(true);
            
            const game = await API.getGame(gameId);
            this.currentGame = game;
            
            this.renderGameDetails(game);
            this.showModal('game-details-modal');
            
        } catch (error) {
            console.error('Error loading game details:', error);
            UI.showNotification('Error al cargar los detalles del juego', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Renderizar detalles del juego
    renderGameDetails(game) {
        const title = document.getElementById('game-details-title');
        const info = document.getElementById('game-details-info');
        const players = document.getElementById('game-details-players');
        
        if (title) {
            title.textContent = `Detalles del Juego - ${game.name || `Juego #${game.id}`}`;
        }
        
        if (info) {
            info.innerHTML = `
                <p><strong>ID:</strong> ${game.id}</p>
                <p><strong>Nombre:</strong> ${game.name || 'Sin nombre'}</p>
                <p><strong>Estado:</strong> <span class="game-status ${this.getStatusClass(game.status)}">${this.getStatusText(game.status)}</span></p>
                <p><strong>Máximo de Jugadores:</strong> ${game.maxPlayers || 4}</p>
                <p><strong>Creador:</strong> ${game.creatorName || 'Desconocido'}</p>
                <p><strong>Fecha de Creación:</strong> ${this.formatDate(game.createdAt)}</p>
                ${game.startedAt ? `<p><strong>Iniciado:</strong> ${this.formatDate(game.startedAt)}</p>` : ''}
                ${game.endedAt ? `<p><strong>Finalizado:</strong> ${this.formatDate(game.endedAt)}</p>` : ''}
            `;
        }
        
        if (players) {
            if (game.players && game.players.length > 0) {
                players.innerHTML = game.players.map(player => `
                    <div class="player-item">
                        <span class="player-name">${player.name || player.username || 'Jugador'}</span>
                        <span class="player-status">${player.id === game.creatorId ? 'Creador' : 'Jugador'}</span>
                    </div>
                `).join('');
            } else {
                players.innerHTML = '<p>No hay jugadores en este juego.</p>';
            }
        }
        
        // Actualizar botones de acción
        this.updateGameDetailButtons(game);
    },
    
    // Actualizar botones de detalles del juego
    updateGameDetailButtons(game) {
        const joinBtn = document.getElementById('join-game-btn');
        const startBtn = document.getElementById('start-game-btn');
        const leaveBtn = document.getElementById('leave-game-btn');
        
        const user = Auth.getCurrentUser();
        if (!user) {
            if (joinBtn) joinBtn.style.display = 'none';
            if (startBtn) startBtn.style.display = 'none';
            if (leaveBtn) leaveBtn.style.display = 'none';
            return;
        }
        
        const isCreator = game.creatorId === user.id;
        const isPlayer = game.players && game.players.some(p => p.id === user.id);
        const canJoin = game.status === 'waiting' && !isPlayer && (game.players ? game.players.length < game.maxPlayers : true);
        const canStart = game.status === 'waiting' && isCreator && game.players && game.players.length >= 2;
        const canLeave = game.status === 'waiting' && isPlayer;
        
        if (joinBtn) {
            joinBtn.style.display = canJoin ? 'inline-flex' : 'none';
            joinBtn.onclick = () => this.joinGame(game.id);
        }
        
        if (startBtn) {
            startBtn.style.display = canStart ? 'inline-flex' : 'none';
            startBtn.onclick = () => this.startGame(game.id);
        }
        
        if (leaveBtn) {
            leaveBtn.style.display = canLeave ? 'inline-flex' : 'none';
            leaveBtn.onclick = () => this.leaveGame(game.id);
        }
    },
    
    // Crear nuevo juego
    async handleCreateGame(e) {
        e.preventDefault();
        
        if (!Auth.checkAuth()) return;
        
        const formData = new FormData(e.target);
        const gameData = {
            name: formData.get('game-name'),
            maxPlayers: parseInt(formData.get('max-players')),
            creatorId: Auth.getCurrentUserId()
        };
        
        try {
            this.showLoading(true);
            
            const response = await API.createGame(gameData);
            
            UI.showNotification('¡Juego creado exitosamente!', 'success');
            this.closeModal('create-game-modal');
            
            // Recargar lista de juegos
            await this.loadGames();
            
            // Mostrar detalles del nuevo juego
            this.showGameDetails(response.id);
            
        } catch (error) {
            console.error('Error creating game:', error);
            UI.showNotification('Error al crear el juego', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Unirse a un juego
    async joinGame(gameId) {
        if (!Auth.checkAuth()) return;
        
        try {
            this.showLoading(true);
            
            const userId = Auth.getCurrentUserId();
            await API.joinGame(gameId, userId);
            
            UI.showNotification('¡Te has unido al juego!', 'success');
            
            // Recargar datos
            await this.loadGames();
            if (this.currentGame && this.currentGame.id === gameId) {
                this.showGameDetails(gameId);
            }
            
        } catch (error) {
            console.error('Error joining game:', error);
            UI.showNotification('Error al unirse al juego', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Iniciar juego
    async startGame(gameId) {
        if (!Auth.checkAuth()) return;
        
        try {
            this.showLoading(true);
            
            await API.startGame(gameId);
            
            UI.showNotification('¡Juego iniciado!', 'success');
            
            // Recargar datos
            await this.loadGames();
            if (this.currentGame && this.currentGame.id === gameId) {
                this.showGameDetails(gameId);
            }
            
        } catch (error) {
            console.error('Error starting game:', error);
            UI.showNotification('Error al iniciar el juego', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Abandonar juego
    async leaveGame(gameId) {
        if (!Auth.checkAuth()) return;
        
        if (!confirm('¿Estás seguro de que quieres abandonar el juego?')) {
            return;
        }
        
        try {
            this.showLoading(true);
            
            const userId = Auth.getCurrentUserId();
            await API.leaveGame(gameId, userId);
            
            UI.showNotification('Has abandonado el juego', 'info');
            
            // Recargar datos
            await this.loadGames();
            this.closeModal('game-details-modal');
            
        } catch (error) {
            console.error('Error leaving game:', error);
            UI.showNotification('Error al abandonar el juego', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Eliminar juego
    async deleteGame(gameId) {
        if (!Auth.checkAuth()) return;
        
        if (!confirm('¿Estás seguro de que quieres eliminar este juego? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            this.showLoading(true);
            
            await API.deleteGame(gameId);
            
            UI.showNotification('Juego eliminado exitosamente', 'success');
            
            // Recargar lista de juegos
            await this.loadGames();
            this.closeModal('game-details-modal');
            
        } catch (error) {
            console.error('Error deleting game:', error);
            UI.showNotification('Error al eliminar el juego', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Filtrar juegos por búsqueda
    filterGames(searchTerm) {
        const gameCards = document.querySelectorAll('.game-card');
        
        gameCards.forEach(card => {
            const gameName = card.querySelector('h3').textContent.toLowerCase();
            const isVisible = gameName.includes(searchTerm.toLowerCase());
            card.style.display = isVisible ? 'block' : 'none';
        });
    },
    
    // Filtrar juegos por estado
    filterGamesByStatus(status) {
        const gameCards = document.querySelectorAll('.game-card');
        
        gameCards.forEach(card => {
            const statusElement = card.querySelector('.game-status');
            const gameStatus = statusElement ? statusElement.textContent.toLowerCase() : '';
            const isVisible = !status || gameStatus.includes(status.toLowerCase());
            card.style.display = isVisible ? 'block' : 'none';
        });
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
        const gamesList = document.getElementById('games-list');
        if (gamesList) {
            if (show) {
                gamesList.innerHTML = `
                    <div class="loading-container">
                        <div class="loading"></div>
                        <p>Cargando juegos...</p>
                    </div>
                `;
            }
        }
    },
    
    // Mostrar modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    // Cerrar modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
};

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Games.init();
});

// Exportar para uso global
window.Games = Games;