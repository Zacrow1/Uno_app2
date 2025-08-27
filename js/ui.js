// ===== MÓDULO DE INTERFAZ DE USUARIO =====
const UI = {
    // Estado del módulo
    currentSection: 'home',
    notificationTimeout: null,
    
    // Inicializar módulo
    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupTooltips();
    },
    
    // Configurar event listeners
    setupEventListeners() {
        // Navegación
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });
        
        // Modales
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Botones de cerrar modal
        const closeButtons = document.querySelectorAll('.close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.closeModal(activeModal.id);
                }
            }
        });
        
        // Prevenir envío de formularios con Enter en modales
        const forms = document.querySelectorAll('.modal form');
        forms.forEach(form => {
            form.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    form.dispatchEvent(new Event('submit'));
                }
            });
        });
    },
    
    // Configurar atajos de teclado
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K para buscar
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Ctrl/Cmd + N para nuevo juego
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.showCreateGameModal();
            }
            
            // Ctrl/Cmd + R para recargar
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshCurrentSection();
            }
            
            // Esc para cerrar modales
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.closeModal(activeModal.id);
                }
            }
        });
    },
    
    // Configurar tooltips
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[title]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.getAttribute('title'));
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    },
    
    // Mostrar sección
    showSection(sectionName) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar sección seleccionada
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Actualizar navegación
            this.updateNavigation(sectionName);
            
            // Cargar datos de la sección
            this.loadSectionData(sectionName);
            
            // Actualizar URL
            this.updateURL(sectionName);
        }
    },
    
    // Actualizar navegación
    updateNavigation(sectionName) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active');
            }
        });
    },
    
    // Cargar datos de la sección
    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'home':
                this.loadDashboardData();
                break;
            case 'games':
                if (window.Games) Games.loadGames();
                break;
            case 'players':
                if (window.Players) Players.loadPlayers();
                break;
            case 'scores':
                if (window.Scores) Scores.loadScores();
                break;
            case 'cache':
                if (window.Cache) Cache.loadCacheStats();
                break;
        }
    },
    
    // Cargar datos del dashboard
    async loadDashboardData() {
        try {
            // Cargar estadísticas generales
            await this.updateDashboardStats();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    },
    
    // Actualizar estadísticas del dashboard
    async updateDashboardStats() {
        try {
            // Verificar salud de la API
            const startTime = Date.now();
            const healthResponse = await API.healthCheck();
            const responseTime = Date.now() - startTime;
            
            // Actualizar tiempo de respuesta
            const responseTimeElement = document.getElementById('response-time');
            if (responseTimeElement) {
                responseTimeElement.textContent = `${responseTime}ms`;
            }
            
            // Cargar estadísticas de jugadores
            const playersResponse = await API.getPlayers();
            const playersCount = playersResponse.data ? playersResponse.data.length : 0;
            const totalPlayersElement = document.getElementById('total-players');
            if (totalPlayersElement) {
                totalPlayersElement.textContent = playersCount;
            }
            
            // Cargar estadísticas de juegos
            const gamesResponse = await API.getGames();
            const gamesData = gamesResponse.data || gamesResponse;
            const activeGames = gamesData.filter(game => game.status === 'playing').length;
            const totalGames = gamesData.length;
            
            const activeGamesElement = document.getElementById('active-games');
            const totalGamesElement = document.getElementById('total-games');
            
            if (activeGamesElement) {
                activeGamesElement.textContent = activeGames;
            }
            if (totalGamesElement) {
                totalGamesElement.textContent = totalGames;
            }
            
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    },
    
    // Refrescar sección actual
    refreshCurrentSection() {
        this.loadSectionData(this.currentSection);
        this.showNotification('Sección actualizada', 'info');
    },
    
    // Mostrar modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Enfocar primer elemento enfocable
            const firstFocusable = modal.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    },
    
    // Cerrar modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Limpiar formularios
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => form.reset());
        }
    },
    
    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notification-message');
        
        if (notification && messageElement) {
            // Limpiar timeout anterior
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
            }
            
            // Establecer mensaje y tipo
            messageElement.textContent = message;
            notification.className = `notification ${type}`;
            
            // Mostrar notificación
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Ocultar automáticamente después de 5 segundos
            this.notificationTimeout = setTimeout(() => {
                this.hideNotification();
            }, 5000);
        }
    },
    
    // Ocultar notificación
    hideNotification() {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.classList.remove('show');
        }
    },
    
    // Mostrar tooltip
    showTooltip(element, text) {
        // Eliminar tooltip existente
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = '#333';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '10000';
        tooltip.style.pointerEvents = 'none';
        
        document.body.appendChild(tooltip);
        
        // Posicionar tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    },
    
    // Ocultar tooltip
    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    },
    
    // Enfocar búsqueda
    focusSearch() {
        const searchInputs = document.querySelectorAll('.search-input');
        const currentSection = this.currentSection;
        
        let targetInput = null;
        
        switch (currentSection) {
            case 'games':
                targetInput = document.getElementById('game-search');
                break;
            case 'players':
                targetInput = document.getElementById('player-search');
                break;
            case 'scores':
                targetInput = document.getElementById('score-search');
                break;
        }
        
        if (targetInput) {
            targetInput.focus();
            targetInput.select();
        }
    },
    
    // Mostrar modal de crear juego
    showCreateGameModal() {
        this.showModal('create-game-modal');
    },
    
    // Mostrar modal de registro
    showRegisterModal() {
        this.showModal('register-modal');
    },
    
    // Actualizar URL
    updateURL(sectionName) {
        const url = new URL(window.location);
        url.hash = sectionName;
        window.history.pushState({}, '', url);
    },
    
    // Manejar navegación del navegador
    handleBrowserNavigation() {
        const hash = window.location.hash.substring(1);
        if (hash && ['home', 'games', 'players', 'scores', 'cache'].includes(hash)) {
            this.showSection(hash);
        }
    },
    
    // Mostrar indicador de carga
    showLoading(element, show = true) {
        if (!element) return;
        
        if (show) {
            element.innerHTML = `
                <div class="loading-container">
                    <div class="loading"></div>
                    <p>Cargando...</p>
                </div>
            `;
            element.style.opacity = '0.5';
        } else {
            element.style.opacity = '1';
        }
    },
    
    // Habilitar/Deshabilitar botón
    setButtonState(button, enabled = true) {
        if (!button) return;
        
        button.disabled = !enabled;
        button.style.opacity = enabled ? '1' : '0.5';
        button.style.pointerEvents = enabled ? 'auto' : 'none';
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
    
    // Formatear número
    formatNumber(number) {
        return new Intl.NumberFormat('es-ES').format(number);
    },
    
    // Validar email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validar contraseña
    validatePassword(password) {
        return password.length >= 6;
    },
    
    // Mostrar error de validación
    showValidationError(field, message) {
        const fieldElement = document.getElementById(field);
        if (fieldElement) {
            fieldElement.classList.add('error');
            
            // Mostrar mensaje de error
            let errorElement = fieldElement.nextElementSibling;
            if (!errorElement || !errorElement.classList.contains('error-message')) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.style.color = '#e74c3c';
                errorElement.style.fontSize = '12px';
                errorElement.style.marginTop = '5px';
                fieldElement.parentNode.insertBefore(errorElement, fieldElement.nextSibling);
            }
            errorElement.textContent = message;
        }
    },
    
    // Limpiar errores de validación
    clearValidationErrors() {
        const errorFields = document.querySelectorAll('.error');
        const errorMessages = document.querySelectorAll('.error-message');
        
        errorFields.forEach(field => field.classList.remove('error'));
        errorMessages.forEach(message => message.remove());
    },
    
    // Confirmar acción
    confirmAction(message, callback) {
        if (confirm(message)) {
            callback();
        }
    },
    
    // Animar elemento
    animateElement(element, animationClass, duration = 1000) {
        if (!element) return;
        
        element.classList.add(animationClass);
        
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, duration);
    },
    
    // Scroll al elemento
    scrollToElement(element, behavior = 'smooth') {
        if (!element) return;
        
        element.scrollIntoView({
            behavior: behavior,
            block: 'start'
        });
    },
    
    // Obtener parámetros de URL
    getUrlParams() {
        const params = {};
        const urlSearchParams = new URLSearchParams(window.location.search);
        
        for (const [key, value] of urlSearchParams.entries()) {
            params[key] = value;
        }
        
        return params;
    }
};

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
    
    // Manejar navegación del navegador
    window.addEventListener('popstate', () => {
        UI.handleBrowserNavigation();
    });
    
    // Cargar sección inicial basada en hash
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        UI.showSection(initialHash);
    }
});

// Exportar para uso global
window.UI = UI;

// Funciones globales para compatibilidad
window.showSection = (section) => UI.showSection(section);
window.showModal = (modalId) => UI.showModal(modalId);
window.closeModal = (modalId) => UI.closeModal(modalId);
window.showCreateGameModal = () => UI.showCreateGameModal();
window.showRegisterModal = () => UI.showRegisterModal();