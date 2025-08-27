// ===== MÓDULO DE AUTENTICACIÓN =====
const Auth = {
    // Estado de autenticación
    isAuthenticated: false,
    userData: null,
    
    // Inicializar módulo
    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    },
    
    // Verificar estado de autenticación
    checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
            this.isAuthenticated = true;
            this.userData = JSON.parse(userData);
            API.token = token;
            this.updateUI();
        } else {
            this.isAuthenticated = false;
            this.userData = null;
            API.clearAuth();
            this.updateUI();
        }
    },
    
    // Configurar event listeners
    setupEventListeners() {
        // Formulario de autenticación
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
        }
        
        // Botón de autenticación en el header
        const authBtn = document.getElementById('auth-btn');
        if (authBtn) {
            authBtn.addEventListener('click', () => this.showAuthModal());
        }
        
        // Toggle entre login y register
        const authToggleBtn = document.querySelector('#auth-form button[type="button"]');
        if (authToggleBtn) {
            authToggleBtn.addEventListener('click', () => this.toggleAuthMode());
        }
        
        // Formulario de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
        }
    },
    
    // Manejar envío de formulario de autenticación
    async handleAuthSubmit(e) {
        e.preventDefault();
        
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const isLogin = document.getElementById('auth-modal-title').textContent === 'Iniciar Sesión';
        
        try {
            this.showLoading(true);
            
            if (isLogin) {
                await this.login(email, password);
            } else {
                const name = document.getElementById('auth-name').value;
                await this.register(name, email, password);
            }
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    },
    
    // Iniciar sesión
    async login(email, password) {
        try {
            const response = await API.login(email, password);
            
            this.isAuthenticated = true;
            this.userData = response.user;
            
            this.updateUI();
            this.closeAuthModal();
            this.showSuccess('¡Sesión iniciada correctamente!');
            
            // Recargar datos de la aplicación
            if (window.loadDashboardData) {
                window.loadDashboardData();
            }
            
        } catch (error) {
            throw new Error('Credenciales inválidas');
        }
    },
    
    // Registrar usuario
    async register(name, email, password) {
        try {
            const response = await API.register({
                username: name,
                email,
                password
            });
            
            this.showSuccess('¡Registro exitoso! Por favor inicia sesión.');
            this.setLoginMode();
            
        } catch (error) {
            throw new Error('Error en el registro. El email podría ya estar en uso.');
        }
    },
    
    // Manejar envío de formulario de registro
    async handleRegisterSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        try {
            this.showLoading(true);
            await this.register(name, email, password);
            this.closeModal('register-modal');
            this.showAuthModal();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    },
    
    // Cerrar sesión
    async logout() {
        try {
            await API.logout();
        } catch (error) {
            console.warn('Error al cerrar sesión:', error);
        } finally {
            this.isAuthenticated = false;
            this.userData = null;
            this.updateUI();
            this.showSuccess('¡Sesión cerrada correctamente!');
            
            // Redirigir a inicio
            showSection('home');
        }
    },
    
    // Actualizar UI según estado de autenticación
    updateUI() {
        const userName = document.getElementById('user-name');
        const authBtn = document.getElementById('auth-btn');
        
        if (this.isAuthenticated && this.userData) {
            // Usuario autenticado
            if (userName) {
                userName.textContent = this.userData.name || this.userData.username || 'Usuario';
            }
            
            if (authBtn) {
                authBtn.textContent = 'Cerrar Sesión';
                authBtn.onclick = () => this.logout();
                authBtn.className = 'btn btn-danger';
            }
            
            // Mostrar/ocultar elementos según autenticación
            this.updateAuthElements(true);
            
        } else {
            // Usuario no autenticado
            if (userName) {
                userName.textContent = 'Invitado';
            }
            
            if (authBtn) {
                authBtn.textContent = 'Iniciar Sesión';
                authBtn.onclick = () => this.showAuthModal();
                authBtn.className = 'btn btn-primary';
            }
            
            // Mostrar/ocultar elementos según autenticación
            this.updateAuthElements(false);
        }
    },
    
    // Actualizar elementos que dependen de autenticación
    updateAuthElements(authenticated) {
        // Botones que requieren autenticación
        const authRequiredButtons = document.querySelectorAll('[data-auth-required]');
        authRequiredButtons.forEach(btn => {
            if (authenticated) {
                btn.disabled = false;
                btn.style.opacity = '1';
            } else {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            }
        });
        
        // Enlaces que requieren autenticación
        const authRequiredLinks = document.querySelectorAll('[data-auth-required-link]');
        authRequiredLinks.forEach(link => {
            if (authenticated) {
                link.style.pointerEvents = 'auto';
                link.style.opacity = '1';
            } else {
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.5';
            }
        });
    },
    
    // Mostrar modal de autenticación
    showAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('active');
            this.setLoginMode();
            document.getElementById('auth-email').focus();
        }
    },
    
    // Cerrar modal de autenticación
    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
            this.resetAuthForm();
        }
    },
    
    // Toggle entre modo login y register
    toggleAuthMode() {
        const title = document.getElementById('auth-modal-title');
        const submitBtn = document.getElementById('auth-submit-btn');
        const toggleText = document.getElementById('auth-toggle-text');
        const nameGroup = document.getElementById('auth-name-group');
        
        if (title.textContent === 'Iniciar Sesión') {
            // Cambiar a modo registro
            title.textContent = 'Registrarse';
            submitBtn.textContent = 'Registrarse';
            toggleText.textContent = 'Iniciar Sesión';
            nameGroup.style.display = 'block';
        } else {
            // Cambiar a modo login
            title.textContent = 'Iniciar Sesión';
            submitBtn.textContent = 'Iniciar Sesión';
            toggleText.textContent = 'Registrarse';
            nameGroup.style.display = 'none';
        }
    },
    
    // Establecer modo login
    setLoginMode() {
        const title = document.getElementById('auth-modal-title');
        const submitBtn = document.getElementById('auth-submit-btn');
        const toggleText = document.getElementById('auth-toggle-text');
        const nameGroup = document.getElementById('auth-name-group');
        
        title.textContent = 'Iniciar Sesión';
        submitBtn.textContent = 'Iniciar Sesión';
        toggleText.textContent = 'Registrarse';
        nameGroup.style.display = 'none';
    },
    
    // Establecer modo registro
    setRegisterMode() {
        const title = document.getElementById('auth-modal-title');
        const submitBtn = document.getElementById('auth-submit-btn');
        const toggleText = document.getElementById('auth-toggle-text');
        const nameGroup = document.getElementById('auth-name-group');
        
        title.textContent = 'Registrarse';
        submitBtn.textContent = 'Registrarse';
        toggleText.textContent = 'Iniciar Sesión';
        nameGroup.style.display = 'block';
    },
    
    // Resetear formulario de autenticación
    resetAuthForm() {
        const form = document.getElementById('auth-form');
        if (form) {
            form.reset();
        }
    },
    
    // Mostrar indicador de carga
    showLoading(show) {
        const submitBtn = document.getElementById('auth-submit-btn');
        if (submitBtn) {
            if (show) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="loading"></span> Procesando...';
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = document.getElementById('auth-modal-title').textContent;
            }
        }
    },
    
    // Mostrar mensaje de éxito
    showSuccess(message) {
        UI.showNotification(message, 'success');
    },
    
    // Mostrar mensaje de error
    showError(message) {
        UI.showNotification(message, 'error');
    },
    
    // Mostrar mensaje de advertencia
    showWarning(message) {
        UI.showNotification(message, 'warning');
    },
    
    // Mostrar mensaje informativo
    showInfo(message) {
        UI.showNotification(message, 'info');
    },
    
    // Verificar si el usuario está autenticado
    checkAuth() {
        if (!this.isAuthenticated) {
            this.showInfo('Por favor inicia sesión para continuar.');
            this.showAuthModal();
            return false;
        }
        return true;
    },
    
    // Obtener datos del usuario actual
    getCurrentUser() {
        return this.userData;
    },
    
    // Obtener ID del usuario actual
    getCurrentUserId() {
        return this.userData ? this.userData.id : null;
    }
};

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Exportar para uso global
window.Auth = Auth;