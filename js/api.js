// ===== CONFIGURACIÓN DE LA API =====
const API = {
    // URL base de la API
    baseURL: 'http://localhost:3000/api',
    
    // Token de autenticación
    token: localStorage.getItem('auth_token') || null,
    
    // Headers por defecto
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    },
    
    // Método genérico para hacer peticiones
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            // Manejar errores HTTP
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },
    
    // Métodos HTTP
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },
    
    // Métodos de autenticación
    async login(email, password) {
        const response = await this.post('/players/login', { email, password });
        if (response.token) {
            this.token = response.token;
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_data', JSON.stringify(response.user));
        }
        return response;
    },
    
    async register(userData) {
        return this.post('/players/register', userData);
    },
    
    async logout() {
        try {
            await this.post('/players/logout');
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.token = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        }
    },
    
    async getProfile() {
        return this.get('/players/profile');
    },
    
    // Métodos de jugadores
    async getPlayers() {
        return this.get('/players');
    },
    
    async getPlayer(id) {
        return this.get(`/players/${id}`);
    },
    
    async createPlayer(playerData) {
        return this.post('/players', playerData);
    },
    
    async updatePlayer(id, playerData) {
        return this.put(`/players/${id}`, playerData);
    },
    
    async deletePlayer(id) {
        return this.delete(`/players/${id}`);
    },
    
    // Métodos de juegos
    async getGames() {
        return this.get('/games');
    },
    
    async getGame(id) {
        return this.get(`/games/${id}`);
    },
    
    async createGame(gameData) {
        return this.post('/games', gameData);
    },
    
    async updateGame(id, gameData) {
        return this.put(`/games/${id}`, gameData);
    },
    
    async deleteGame(id) {
        return this.delete(`/games/${id}`);
    },
    
    async joinGame(gameId, playerId) {
        return this.post(`/games/${gameId}/join`, { playerId });
    },
    
    async startGame(gameId) {
        return this.post(`/games/${gameId}/start`, {});
    },
    
    async leaveGame(gameId, playerId) {
        return this.post(`/games/${gameId}/leave`, { playerId });
    },
    
    async endGame(gameId, winnerId) {
        return this.post(`/games/${gameId}/end`, { winnerId });
    },
    
    async getGameState(gameId) {
        return this.get(`/games/${gameId}/state`);
    },
    
    async getPlayersInGame(gameId) {
        return this.get(`/games/${gameId}/players`);
    },
    
    async getCurrentPlayer(gameId) {
        return this.get(`/games/${gameId}/current-player`);
    },
    
    async getTopCard(gameId) {
        return this.get(`/games/${gameId}/top-card`);
    },
    
    async getGameScores(gameId) {
        return this.get(`/games/${gameId}/scores`);
    },
    
    // Métodos de cartas
    async getCards() {
        return this.get('/cards');
    },
    
    async getCard(id) {
        return this.get(`/cards/${id}`);
    },
    
    async createCard(cardData) {
        return this.post('/cards', cardData);
    },
    
    async updateCard(id, cardData) {
        return this.put(`/cards/${id}`, cardData);
    },
    
    async deleteCard(id) {
        return this.delete(`/cards/${id}`);
    },
    
    // Métodos de acciones de cartas
    async getPlayerHand(gameId) {
        return this.get(`/games/${gameId}/hand`);
    },
    
    async playCard(gameId, playerId, cardId, color = null) {
        const data = { playerId, cardId };
        if (color) data.color = color;
        return this.post(`/games/${gameId}/play-card`, data);
    },
    
    async drawCard(gameId, playerId) {
        return this.post(`/games/${gameId}/draw-card`, { playerId });
    },
    
    async getPlayedCards(gameId) {
        return this.get(`/games/${gameId}/played-cards`);
    },
    
    async getLastPlayedCard(gameId) {
        return this.get(`/games/${gameId}/last-card`);
    },
    
    // Métodos de puntuaciones
    async getScores() {
        return this.get('/scores');
    },
    
    async getScore(id) {
        return this.get(`/scores/${id}`);
    },
    
    async createScore(scoreData) {
        return this.post('/scores', scoreData);
    },
    
    async updateScore(id, scoreData) {
        return this.put(`/scores/${id}`, scoreData);
    },
    
    async deleteScore(id) {
        return this.delete(`/scores/${id}`);
    },
    
    // Métodos de caché
    async getCacheStats() {
        return this.get('/cache/stats');
    },
    
    async clearCache() {
        return this.post('/cache/clear');
    },
    
    async deleteCacheEntry(key) {
        return this.delete(`/cache/${key}`);
    },
    
    async reconfigureCache(config) {
        return this.post('/cache/reconfigure', config);
    },
    
    // Métodos de salud
    async healthCheck() {
        return this.get('/health');
    },
    
    // Utilidades
    isAuthenticated() {
        return !!this.token;
    },
    
    getUserData() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    },
    
    clearAuth() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }
};

// Exportar la API para uso global
window.API = API;