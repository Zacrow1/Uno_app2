class UnoGame {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.token = localStorage.getItem('token');
        this.currentUser = null;
        this.currentGame = null;
        this.gameInterval = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Auth tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Auth forms
        document.getElementById('login-form-element').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form-element').addEventListener('submit', (e) => this.handleRegister(e));

        // Game actions
        document.getElementById('create-game-btn').addEventListener('click', () => this.showCreateGameModal());
        document.getElementById('refresh-games-btn').addEventListener('click', () => this.loadGames());
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        document.getElementById('leave-game-btn').addEventListener('click', () => this.leaveGame());
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('draw-card-btn').addEventListener('click', () => this.drawCard());
        document.getElementById('end-game-btn').addEventListener('click', () => this.endGame());
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-form`).classList.add('active');
    }

    async checkAuth() {
        if (this.token) {
            try {
                const response = await this.makeRequest('/players/profile', 'GET');
                this.currentUser = response;
                this.showGameSection();
            } catch (error) {
                this.removeToken();
                this.showAuthSection();
            }
        } else {
            this.showAuthSection();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            this.showLoading();
            const response = await this.makeRequest('/players/login', 'POST', { username, password });
            this.token = response.token;
            this.currentUser = response.user;
            this.setToken();
            this.showGameSection();
            this.showMessage('Inicio de sesión exitoso', 'success');
        } catch (error) {
            this.showMessage('Error en el inicio de sesión', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            this.showLoading();
            const response = await this.makeRequest('/players/register', 'POST', { username, email, password });
            this.showMessage('Registro exitoso. Por favor inicia sesión.', 'success');
            this.switchTab('login');
        } catch (error) {
            this.showMessage('Error en el registro', 'error');
        } finally {
            this.hideLoading();
        }
    }

    handleLogout() {
        this.removeToken();
        this.currentUser = null;
        this.currentGame = null;
        this.showAuthSection();
        this.showMessage('Sesión cerrada', 'info');
    }

    showAuthSection() {
        document.getElementById('auth-section').style.display = 'flex';
        document.getElementById('game-section').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';
    }

    showGameSection() {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('game-section').style.display = 'block';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('username').textContent = this.currentUser.username;
        this.loadGames();
    }

    async loadGames() {
        try {
            this.showLoading();
            const games = await this.makeRequest('/games', 'GET');
            this.displayGames(games);
        } catch (error) {
            this.showMessage('Error al cargar partidas', 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayGames(games) {
        const container = document.getElementById('games-container');
        container.innerHTML = '';

        if (games.length === 0) {
            container.innerHTML = '<p>No hay partidas disponibles</p>';
            return;
        }

        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <h4>${game.name}</h4>
                <p>Jugadores: ${game.currentPlayers}/${game.maxPlayers}</p>
                <p>Estado: ${game.status}</p>
                <button class="btn btn-primary" onclick="unoGame.joinGame(${game.id})">
                    ${game.status === 'waiting' ? 'Unirse' : 'Ver'}
                </button>
            `;
            container.appendChild(gameCard);
        });
    }

    showCreateGameModal() {
        const name = prompt('Nombre de la partida:');
        if (!name) return;

        const maxPlayers = prompt('Número máximo de jugadores (2-10):', '4');
        if (!maxPlayers || maxPlayers < 2 || maxPlayers > 10) {
            this.showMessage('Número de jugadores inválido', 'error');
            return;
        }

        this.createGame(name, maxPlayers);
    }

    async createGame(name, maxPlayers) {
        try {
            this.showLoading();
            const game = await this.makeRequest('/games', 'POST', {
                name,
                rules: 'Standard UNO rules',
                maxPlayers: parseInt(maxPlayers)
            });
            this.showMessage('Partida creada exitosamente', 'success');
            this.loadGames();
            this.joinGame(game.id);
        } catch (error) {
            this.showMessage('Error al crear partida', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async joinGame(gameId) {
        try {
            this.showLoading();
            await this.makeRequest(`/games/${gameId}/join`, 'POST');
            this.currentGame = { id: gameId };
            this.showGameRoom();
            this.startGameUpdates();
            this.showMessage('Te uniste a la partida', 'success');
        } catch (error) {
            this.showMessage('Error al unirse a la partida', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async leaveGame() {
        if (!this.currentGame) return;

        try {
            this.showLoading();
            await this.makeRequest(`/games/${this.currentGame.id}/leave`, 'POST');
            this.currentGame = null;
            this.stopGameUpdates();
            this.showGameLobby();
            this.loadGames();
            this.showMessage('Abandonaste la partida', 'info');
        } catch (error) {
            this.showMessage('Error al abandonar la partida', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async startGame() {
        if (!this.currentGame) return;

        try {
            this.showLoading();
            await this.makeRequest(`/games/${this.currentGame.id}/start`, 'POST');
            this.showMessage('Partida iniciada', 'success');
            this.updateGameRoom();
        } catch (error) {
            this.showMessage('Error al iniciar la partida', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async endGame() {
        if (!this.currentGame) return;

        try {
            this.showLoading();
            await this.makeRequest(`/games/${this.currentGame.id}/end`, 'POST');
            this.showMessage('Partida terminada', 'info');
            this.leaveGame();
        } catch (error) {
            this.showMessage('Error al terminar la partida', 'error');
        } finally {
            this.hideLoading();
        }
    }

    showGameLobby() {
        document.getElementById('game-lobby').style.display = 'block';
        document.getElementById('game-room').style.display = 'none';
    }

    showGameRoom() {
        document.getElementById('game-lobby').style.display = 'none';
        document.getElementById('game-room').style.display = 'block';
        this.updateGameRoom();
    }

    async updateGameRoom() {
        if (!this.currentGame) return;

        try {
            const game = await this.makeRequest(`/games/${this.currentGame.id}`, 'GET');
            document.getElementById('game-name').textContent = game.name;
            document.getElementById('game-status').textContent = game.status;

            // Load players
            const players = await this.makeRequest(`/games/${this.currentGame.id}/players`, 'GET');
            this.displayPlayers(players);

            // Show/hide start game button
            const startBtn = document.getElementById('start-game-btn');
            if (game.status === 'waiting' && players.length >= 2) {
                startBtn.style.display = 'block';
            } else {
                startBtn.style.display = 'none';
            }

            // Show game board if game is started
            if (game.status === 'playing') {
                document.getElementById('game-board').style.display = 'block';
                await this.updateGameBoard();
            } else {
                document.getElementById('game-board').style.display = 'none';
            }
        } catch (error) {
            console.error('Error updating game room:', error);
        }
    }

    displayPlayers(players) {
        const container = document.getElementById('players-in-game');
        container.innerHTML = '';

        players.forEach(player => {
            const playerTag = document.createElement('div');
            playerTag.className = 'player-tag';
            playerTag.textContent = player.username;
            container.appendChild(playerTag);
        });
    }

    async updateGameBoard() {
        if (!this.currentGame) return;

        try {
            // Get current player
            const currentPlayer = await this.makeRequest(`/games/${this.currentGame.id}/current-player`, 'GET');
            document.getElementById('current-player-name').textContent = currentPlayer.username;

            // Get top card
            const topCard = await this.makeRequest(`/games/${this.currentGame.id}/top-card`, 'GET');
            this.displayTopCard(topCard);

            // Get player hand
            const hand = await this.makeRequest(`/games/${this.currentGame.id}/hand`, 'GET');
            this.displayPlayerHand(hand);
        } catch (error) {
            console.error('Error updating game board:', error);
        }
    }

    displayTopCard(card) {
        const container = document.getElementById('top-card-display');
        if (card) {
            container.className = `card ${card.color}`;
            container.textContent = card.value;
        } else {
            container.className = 'card';
            container.textContent = '';
        }
    }

    displayPlayerHand(cards) {
        const container = document.getElementById('player-cards');
        container.innerHTML = '';

        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = `card ${card.color}`;
            cardElement.textContent = card.value;
            cardElement.addEventListener('click', () => this.playCard(card.id));
            container.appendChild(cardElement);
        });
    }

    async playCard(cardId) {
        if (!this.currentGame) return;

        try {
            this.showLoading();
            await this.makeRequest(`/games/${this.currentGame.id}/play-card`, 'POST', { playerCardId: cardId });
            this.showMessage('Carta jugada', 'success');
            this.updateGameBoard();
        } catch (error) {
            this.showMessage('Error al jugar carta', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async drawCard() {
        if (!this.currentGame) return;

        try {
            this.showLoading();
            await this.makeRequest(`/games/${this.currentGame.id}/draw-card`, 'POST');
            this.showMessage('Carta robada', 'success');
            this.updateGameBoard();
        } catch (error) {
            this.showMessage('Error al robar carta', 'error');
        } finally {
            this.hideLoading();
        }
    }

    startGameUpdates() {
        this.gameInterval = setInterval(() => {
            this.updateGameRoom();
        }, 3000);
    }

    stopGameUpdates() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBase}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (this.token) {
            options.headers.Authorization = `Bearer ${this.token}`;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    setToken() {
        localStorage.setItem('token', this.token);
    }

    removeToken() {
        localStorage.removeItem('token');
        this.token = null;
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showMessage(text, type = 'info') {
        const container = document.getElementById('message-container');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        container.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// Initialize the game
const unoGame = new UnoGame();