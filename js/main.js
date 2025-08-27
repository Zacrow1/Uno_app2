// ===== ARCHIVO PRINCIPAL =====
// Este archivo coordina todos los módulos y configura la aplicación

// Configuración global de la aplicación
const App = {
    // Versión de la aplicación
    version: '1.0.0',
    
    // Estado de la aplicación
    initialized: false,
    online: navigator.onLine,
    
    // Inicializar aplicación
    async init() {
        try {
            console.log(`🎮 UNO Digital Frontend v${this.version}`);
            console.log('🚀 Inicializando aplicación...');
            
            // Verificar soporte del navegador
            if (!this.checkBrowserSupport()) {
                this.showBrowserNotSupported();
                return;
            }
            
            // Configurar manejo de errores global
            this.setupGlobalErrorHandling();
            
            // Configurar detección de conexión
            this.setupConnectionDetection();
            
            // Inicializar módulos
            await this.initializeModules();
            
            // Configurar actualización automática
            this.setupAutoRefresh();
            
            // Marcar como inicializado
            this.initialized = true;
            
            console.log('✅ Aplicación inicializada correctamente');
            
            // Mostrar notificación de bienvenida
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.showInitializationError(error);
        }
    },
    
    // Verificar soporte del navegador
    checkBrowserSupport() {
        const requiredFeatures = [
            'fetch',
            'localStorage',
            'sessionStorage',
            'addEventListener',
            'querySelector',
            'classList'
        ];
        
        const unsupportedFeatures = requiredFeatures.filter(feature => !(feature in window || feature in document));
        
        if (unsupportedFeatures.length > 0) {
            console.error('❌ Características no soportadas:', unsupportedFeatures);
            return false;
        }
        
        return true;
    },
    
    // Mostrar mensaje de navegador no soportado
    showBrowserNotSupported() {
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = `
                <div class="browser-not-supported">
                    <h1>❌ Navegador No Soportado</h1>
                    <p>Tu navegador no soporta las características necesarias para ejecutar esta aplicación.</p>
                    <p>Por favor, actualiza tu navegador o prueba con otro navegador moderno.</p>
                    <div class="supported-browsers">
                        <h3>Navegadores Soportados:</h3>
                        <ul>
                            <li>Chrome 60+</li>
                            <li>Firefox 55+</li>
                            <li>Safari 12+</li>
                            <li>Edge 79+</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    },
    
    // Configurar manejo de errores global
    setupGlobalErrorHandling() {
        // Errores de JavaScript
        window.addEventListener('error', (event) => {
            console.error('❌ Error global:', event.error);
            this.reportError(event.error);
        });
        
        // Promesas rechazadas no manejadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Promesa rechazada no manejada:', event.reason);
            this.reportError(event.reason);
        });
        
        // Errores de red
        window.addEventListener('offline', () => {
            this.online = false;
            this.showOfflineMessage();
        });
        
        window.addEventListener('online', () => {
            this.online = true;
            this.showOnlineMessage();
        });
    },
    
    // Configurar detección de conexión
    setupConnectionDetection() {
        // Verificar conexión inicial
        this.online = navigator.onLine;
        
        // Monitorear cambios de conexión
        setInterval(() => {
            if (navigator.onLine !== this.online) {
                this.online = navigator.onLine;
                if (this.online) {
                    this.showOnlineMessage();
                } else {
                    this.showOfflineMessage();
                }
            }
        }, 5000);
    },
    
    // Inicializar módulos
    async initializeModules() {
        // Inicializar módulos en orden específico
        const modules = [
            { name: 'API', initializer: () => console.log('📡 API module initialized') },
            { name: 'UI', initializer: () => window.UI && window.UI.init() },
            { name: 'Auth', initializer: () => window.Auth && window.Auth.init() },
            { name: 'Games', initializer: () => window.Games && window.Games.init() },
            { name: 'Players', initializer: () => window.Players && window.Players.init() },
            { name: 'Scores', initializer: () => window.Scores && window.Scores.init() },
            { name: 'Cache', initializer: () => window.Cache && window.Cache.init() }
        ];
        
        for (const module of modules) {
            try {
                console.log(`🔧 Inicializando módulo: ${module.name}`);
                await module.initializer();
                console.log(`✅ Módulo ${module.name} inicializado`);
            } catch (error) {
                console.error(`❌ Error al inicializar módulo ${module.name}:`, error);
                // Continuar con otros módulos aunque uno falle
            }
        }
    },
    
    // Configurar actualización automática
    setupAutoRefresh() {
        // Actualizar dashboard cada 30 segundos
        setInterval(() => {
            if (this.currentSection === 'home') {
                this.updateDashboardStats();
            }
        }, 30000);
        
        // Verificar salud de la API cada 60 segundos
        setInterval(() => {
            this.checkAPIHealth();
        }, 60000);
    },
    
    // Mostrar mensaje de bienvenida
    showWelcomeMessage() {
        const user = window.Auth ? window.Auth.getCurrentUser() : null;
        
        if (user) {
            UI.showNotification(`¡Bienvenido de nuevo, ${user.name || user.username}!`, 'success');
        } else {
            UI.showNotification('¡Bienvenido a UNO Digital! Por favor inicia sesión.', 'info');
        }
    },
    
    // Mostrar error de inicialización
    showInitializationError(error) {
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = `
                <div class="initialization-error">
                    <h1>❌ Error de Inicialización</h1>
                    <p>Ha ocurrido un error al inicializar la aplicación.</p>
                    <p><strong>Detalles del error:</strong> ${error.message}</p>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-sync"></i>
                            Reintentar
                        </button>
                        <button class="btn btn-secondary" onclick="App.clearCacheAndReload()">
                            <i class="fas fa-trash"></i>
                            Limpiar Caché y Recargar
                        </button>
                    </div>
                </div>
            `;
        }
    },
    
    // Mostrar mensaje sin conexión
    showOfflineMessage() {
        UI.showNotification('Sin conexión a internet. Algunas funciones pueden no estar disponibles.', 'warning');
    },
    
    // Mostrar mensaje con conexión
    showOnlineMessage() {
        UI.showNotification('Conexión restablecida.', 'success');
    },
    
    // Actualizar estadísticas del dashboard
    async updateDashboardStats() {
        try {
            if (window.UI) {
                await window.UI.updateDashboardStats();
            }
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    },
    
    // Verificar salud de la API
    async checkAPIHealth() {
        try {
            if (window.API) {
                await window.API.healthCheck();
            }
        } catch (error) {
            console.error('API health check failed:', error);
            UI.showNotification('La API no está disponible. Por favor, intenta más tarde.', 'error');
        }
    },
    
    // Reportar error (placeholder para futuro sistema de reporte)
    reportError(error) {
        console.error('Error reportado:', error);
        // Aquí se podría implementar un sistema de reporte de errores
        // como enviar a un servicio de monitoreo
    },
    
    // Limpiar caché y recargar
    clearCacheAndReload() {
        try {
            // Limpiar localStorage
            localStorage.clear();
            
            // Limpiar sessionStorage
            sessionStorage.clear();
            
            // Recargar página
            location.reload();
        } catch (error) {
            console.error('Error clearing cache:', error);
            location.reload();
        }
    },
    
    // Obtener información de la aplicación
    getAppInfo() {
        return {
            version: this.version,
            initialized: this.initialized,
            online: this.online,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timestamp: new Date().toISOString()
        };
    },
    
    // Salir de la aplicación
    exit() {
        if (confirm('¿Estás seguro de que quieres salir de la aplicación?')) {
            // Limpiar recursos
            if (window.Cache) {
                window.Cache.stopAutoRefresh();
            }
            
            // Cerrar sesión si está autenticado
            if (window.Auth && window.Auth.isAuthenticated) {
                window.Auth.logout();
            }
            
            // Redirigir a una página de salida o cerrar pestaña
            window.close();
        }
    }
};

// Función para inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await App.init();
    } catch (error) {
        console.error('Error al iniciar la aplicación:', error);
        App.showInitializationError(error);
    }
});

// Manejar el evento beforeunload para limpiar recursos
window.addEventListener('beforeunload', () => {
    // Limpiar temporizadores y recursos
    if (window.Cache) {
        window.Cache.stopAutoRefresh();
    }
});

// Exportar la aplicación para uso global
window.App = App;

// Funciones de utilidad globales
window.showSection = (section) => {
    if (window.UI) {
        window.UI.showSection(section);
    }
};

window.showModal = (modalId) => {
    if (window.UI) {
        window.UI.showModal(modalId);
    }
};

window.closeModal = (modalId) => {
    if (window.UI) {
        window.UI.closeModal(modalId);
    }
};

window.showCreateGameModal = () => {
    if (window.UI) {
        window.UI.showCreateGameModal();
    }
};

window.showRegisterModal = () => {
    if (window.UI) {
        window.UI.showRegisterModal();
    }
};

// Función global para cargar datos del dashboard
window.loadDashboardData = async () => {
    if (window.UI) {
        await window.UI.updateDashboardStats();
    }
};

// Función global para refrescar puntuaciones
window.refreshScores = () => {
    if (window.Scores) {
        window.Scores.loadScores();
    }
};

// Atajos de teclado adicionales
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + R para recargar forzada
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'r') {
        e.preventDefault();
        App.clearCacheAndReload();
    }
    
    // F1 para ayuda
    if (e.key === 'F1') {
        e.preventDefault();
        App.showHelp();
    }
});

// Extender App con función de ayuda
App.showHelp = () => {
    const helpContent = `
    === AYUDA DE UNO DIGITAL ===
    
    ATAJOS DE TECLADO:
    - Ctrl/Cmd + K: Buscar
    - Ctrl/Cmd + N: Nuevo juego
    - Ctrl/Cmd + R: Recargar
    - Ctrl/Cmd + Shift + R: Recargar forzada
    - Esc: Cerrar modales
    - F1: Mostrar ayuda
    
    SECCIONES:
    - Inicio: Dashboard con estadísticas
    - Juegos: Gestión de partidas
    - Jugadores: Gestión de jugadores
    - Puntuaciones: Tabla de líderes
    - Caché: Monitoreo de caché
    
    MÓDULOS CARGADOS:
    - API: Comunicación con el backend
    - UI: Interfaz de usuario
    - Auth: Autenticación
    - Games: Gestión de juegos
    - Players: Gestión de jugadores
    - Scores: Gestión de puntuaciones
    - Cache: Gestión de caché
    
    VERSIÓN: ${App.version}
    `;
    
    console.log(helpContent);
    UI.showNotification('Ayuda mostrada en la consola (F12)', 'info');
};

console.log('🎮 UNO Digital Frontend cargado');
console.log('📖 Presiona F1 para ver la ayuda');