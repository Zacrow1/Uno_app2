// ===== MÓDULO DE GESTIÓN DE JUGADORES =====
const Players = {
    // Estado del módulo
    players: [],
    loading: false,
    
    // Inicializar módulo
    init() {
        this.setupEventListeners();
        this.loadPlayers();
    },
    
    // Configurar event listeners
    setupEventListeners() {
        // Búsqueda de jugadores
        const playerSearch = document.getElementById('player-search');
        if (playerSearch) {
            playerSearch.addEventListener('input', (e) => this.filterPlayers(e.target.value));
        }
        
        // Formulario de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
        }
    },
    
    // Cargar lista de jugadores
    async loadPlayers() {
        try {
            this.loading = true;
            this.showLoading(true);
            
            const response = await API.getPlayers();
            this.players = response.data || response;
            
            this.renderPlayers();
            
        } catch (error) {
            console.error('Error loading players:', error);
            UI.showNotification('Error al cargar los jugadores', 'error');
        } finally {
            this.loading = false;
            this.showLoading(false);
        }
    },
    
    // Renderizar lista de jugadores
    renderPlayers() {
        const playersList = document.getElementById('players-list');
        if (!playersList) return;
        
        if (this.players.length === 0) {
            playersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No hay jugadores registrados</h3>
                    <p>Registra un nuevo jugador para empezar</p>
                    <button class="btn btn-primary" onclick="showRegisterModal()">
                        <i class="fas fa-user-plus"></i>
                        Registrar Jugador
                    </button>
                </div>
            `;
            return;
        }
        
        playersList.innerHTML = this.players.map(player => this.createPlayerCard(player)).join('');
        
        // Agregar event listeners a las tarjetas
        this.attachPlayerCardListeners();
    },
    
    // Crear tarjeta de jugador
    createPlayerCard(player) {
        const currentUser = Auth.getCurrentUser();
        const isCurrentUser = currentUser && player.id === currentUser.id;
        
        return `
            <div class="player-card" data-player-id="${player.id}">
                <h3>
                    <i class="fas fa-user"></i>
                    ${player.name || player.username || 'Jugador'}
                    ${isCurrentUser ? '<span class="badge badge-primary">Tú</span>' : ''}
                </h3>
                <div class="player-info">
                    <p><strong>Email:</strong> ${player.email || 'No disponible'}</p>
                    <p><strong>Registrado:</strong> ${this.formatDate(player.createdAt)}</p>
                    ${player.totalGames !== undefined ? `<p><strong>Partidas:</strong> ${player.totalGames}</p>` : ''}
                    ${player.totalScore !== undefined ? `<p><strong>Puntuación Total:</strong> ${player.totalScore}</p>` : ''}
                </div>
                <div class="player-actions">
                    <button class="btn btn-primary" onclick="Players.showPlayerDetails(${player.id})">
                        <i class="fas fa-eye"></i>
                        Ver Detalles
                    </button>
                    ${this.getPlayerActionButtons(player)}
                </div>
            </div>
        `;
    },
    
    // Obtener botones de acción según el jugador
    getPlayerActionButtons(player) {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return '';
        
        const isCurrentUser = player.id === currentUser.id;
        
        let buttons = '';
        
        if (isCurrentUser) {
            buttons += `
                <button class="btn btn-secondary" onclick="Players.editPlayer(${player.id})">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
            `;
        }
        
        // Aquí podrían agregarse más acciones como ver historial de partidas, etc.
        
        return buttons;
    },
    
    // Agregar event listeners a las tarjetas de jugador
    attachPlayerCardListeners() {
        // Los listeners se agregan mediante onclick en el HTML
    },
    
    // Mostrar detalles del jugador
    async showPlayerDetails(playerId) {
        try {
            this.showLoading(true);
            
            const player = await API.getPlayer(playerId);
            
            // Aquí podrías mostrar un modal con detalles completos del jugador
            this.showPlayerDetailsModal(player);
            
        } catch (error) {
            console.error('Error loading player details:', error);
            UI.showNotification('Error al cargar los detalles del jugador', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Mostrar modal con detalles del jugador
    showPlayerDetailsModal(player) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalles del Jugador</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="player-details">
                        <div class="player-detail-item">
                            <strong>ID:</strong> ${player.id}
                        </div>
                        <div class="player-detail-item">
                            <strong>Nombre:</strong> ${player.name || player.username || 'No disponible'}
                        </div>
                        <div class="player-detail-item">
                            <strong>Email:</strong> ${player.email || 'No disponible'}
                        </div>
                        <div class="player-detail-item">
                            <strong>Fecha de Registro:</strong> ${this.formatDate(player.createdAt)}
                        </div>
                        ${player.totalGames !== undefined ? `
                        <div class="player-detail-item">
                            <strong>Total de Partidas:</strong> ${player.totalGames}
                        </div>
                        ` : ''}
                        ${player.totalScore !== undefined ? `
                        <div class="player-detail-item">
                            <strong>Puntuación Total:</strong> ${player.totalScore}
                        </div>
                        ` : ''}
                        ${player.averageScore !== undefined ? `
                        <div class="player-detail-item">
                            <strong>Puntuación Promedio:</strong> ${player.averageScore.toFixed(2)}
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
    
    // Editar jugador (placeholder para futura implementación)
    editPlayer(playerId) {
        if (!Auth.checkAuth()) return;
        
        const currentUser = Auth.getCurrentUser();
        if (!currentUser || currentUser.id !== playerId) {
            UI.showNotification('No tienes permiso para editar este jugador', 'error');
            return;
        }
        
        UI.showNotification('Función de edición en desarrollo', 'info');
    },
    
    // Manejar envío de formulario de registro
    async handleRegisterSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const playerData = {
            username: formData.get('register-name'),
            email: formData.get('register-email'),
            password: formData.get('register-password')
        };
        
        try {
            this.showLoading(true);
            
            const response = await API.register(playerData);
            
            UI.showNotification('¡Jugador registrado exitosamente! Por favor inicia sesión.', 'success');
            this.closeModal('register-modal');
            
            // Limpiar formulario
            e.target.reset();
            
            // Recargar lista de jugadores
            await this.loadPlayers();
            
            // Mostrar modal de login
            Auth.showAuthModal();
            
        } catch (error) {
            console.error('Error registering player:', error);
            UI.showNotification('Error al registrar el jugador', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Filtrar jugadores por búsqueda
    filterPlayers(searchTerm) {
        const playerCards = document.querySelectorAll('.player-card');
        
        playerCards.forEach(card => {
            const playerName = card.querySelector('h3').textContent.toLowerCase();
            const playerEmail = card.querySelector('.player-info p')?.textContent.toLowerCase() || '';
            const isVisible = playerName.includes(searchTerm.toLowerCase()) || 
                             playerEmail.includes(searchTerm.toLowerCase());
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
        const playersList = document.getElementById('players-list');
        if (playersList) {
            if (show) {
                playersList.innerHTML = `
                    <div class="loading-container">
                        <div class="loading"></div>
                        <p>Cargando jugadores...</p>
                    </div>
                `;
            }
        }
    },
    
    // Cerrar modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    // Obtener estadísticas de jugadores
    getPlayerStats() {
        if (this.players.length === 0) {
            return {
                total: 0,
                active: 0,
                newThisMonth: 0
            };
        }
        
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        const stats = {
            total: this.players.length,
            active: this.players.filter(p => {
                // Considerar activos si se registraron en los últimos 30 días
                const lastActivity = new Date(p.updatedAt || p.createdAt);
                const daysDiff = (now - lastActivity) / (1000 * 60 * 60 * 24);
                return daysDiff <= 30;
            }).length,
            newThisMonth: this.players.filter(p => {
                const registerDate = new Date(p.createdAt);
                return registerDate.getMonth() === thisMonth && 
                       registerDate.getFullYear() === thisYear;
            }).length
        };
        
        return stats;
    }
};

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Players.init();
});

// Exportar para uso global
window.Players = Players;