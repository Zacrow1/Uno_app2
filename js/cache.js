// ===== MÓDULO DE GESTIÓN DE CACHÉ =====
const Cache = {
    // Estado del módulo
    cacheStats: null,
    loading: false,
    refreshInterval: null,
    
    // Inicializar módulo
    init() {
        this.setupEventListeners();
        this.loadCacheStats();
        this.startAutoRefresh();
    },
    
    // Configurar event listeners
    setupEventListeners() {
        // Botón de refrescar
        const refreshBtn = document.querySelector('button[onclick="refreshCacheStats()"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadCacheStats());
        }
        
        // Botón de limpiar caché
        const clearBtn = document.querySelector('button[onclick="clearCache()"]');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCache());
        }
    },
    
    // Iniciar auto-refresco
    startAutoRefresh() {
        // Refrescar cada 30 segundos
        this.refreshInterval = setInterval(() => {
            this.loadCacheStats();
        }, 30000);
    },
    
    // Detener auto-refresco
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    },
    
    // Cargar estadísticas de caché
    async loadCacheStats() {
        try {
            this.loading = true;
            this.showLoading(true);
            
            const response = await API.getCacheStats();
            this.cacheStats = response;
            
            this.renderCacheStats();
            
        } catch (error) {
            console.error('Error loading cache stats:', error);
            UI.showNotification('Error al cargar las estadísticas de caché', 'error');
        } finally {
            this.loading = false;
            this.showLoading(false);
        }
    },
    
    // Renderizar estadísticas de caché
    renderCacheStats() {
        if (!this.cacheStats) return;
        
        // Actualizar estadísticas generales
        this.updateCacheGeneralStats();
        
        // Actualizar lista de entradas
        this.updateCacheEntriesList();
    },
    
    // Actualizar estadísticas generales
    updateCacheGeneralStats() {
        const sizeElement = document.getElementById('cache-size');
        const entriesElement = document.getElementById('cache-entries');
        const memoryElement = document.getElementById('cache-memory');
        
        if (sizeElement) {
            sizeElement.textContent = `${this.cacheStats.size || 0} / ${this.cacheStats.max || 0}`;
        }
        
        if (entriesElement) {
            entriesElement.textContent = this.cacheStats.size || 0;
        }
        
        if (memoryElement) {
            const memoryMB = this.estimateMemoryUsage();
            memoryElement.textContent = `${memoryMB} MB`;
        }
    },
    
    // Actualizar lista de entradas de caché
    updateCacheEntriesList() {
        const entriesList = document.getElementById('cache-entries-list');
        if (!entriesList) return;
        
        if (!this.cacheStats.keys || this.cacheStats.keys.length === 0) {
            entriesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-database"></i>
                    <p>No hay entradas en caché</p>
                </div>
            `;
            return;
        }
        
        entriesList.innerHTML = this.cacheStats.keys.map(key => this.createCacheEntryElement(key)).join('');
        
        // Agregar event listeners
        this.attachCacheEntryListeners();
    },
    
    // Crear elemento de entrada de caché
    createCacheEntryElement(key) {
        return `
            <div class="cache-entry" data-cache-key="${key}">
                <div class="cache-entry-key">
                    <i class="fas fa-key"></i>
                    <span>${this.truncateKey(key)}</span>
                </div>
                <div class="cache-entry-actions">
                    <button class="btn btn-sm btn-danger" onclick="Cache.deleteCacheEntry('${key}')" title="Eliminar entrada">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="Cache.copyCacheKey('${key}')" title="Copiar clave">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        `;
    },
    
    // Truncar clave para mostrar
    truncateKey(key, maxLength = 50) {
        if (key.length <= maxLength) return key;
        return key.substring(0, maxLength) + '...';
    },
    
    // Agregar event listeners a las entradas de caché
    attachCacheEntryListeners() {
        // Los listeners se agregan mediante onclick en el HTML
    },
    
    // Limpiar toda la caché
    async clearCache() {
        if (!confirm('¿Estás seguro de que quieres limpiar toda la caché? Esta acción eliminará todas las entradas cacheadas.')) {
            return;
        }
        
        try {
            this.showLoading(true);
            
            await API.clearCache();
            
            UI.showNotification('Caché limpiada exitosamente', 'success');
            
            // Recargar estadísticas
            await this.loadCacheStats();
            
        } catch (error) {
            console.error('Error clearing cache:', error);
            UI.showNotification('Error al limpiar la caché', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Eliminar entrada específica de caché
    async deleteCacheEntry(key) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta entrada de caché?')) {
            return;
        }
        
        try {
            this.showLoading(true);
            
            await API.deleteCacheEntry(key);
            
            UI.showNotification('Entrada eliminada exitosamente', 'success');
            
            // Recargar estadísticas
            await this.loadCacheStats();
            
        } catch (error) {
            console.error('Error deleting cache entry:', error);
            UI.showNotification('Error al eliminar la entrada de caché', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Copiar clave de caché al portapapeles
    async copyCacheKey(key) {
        try {
            await navigator.clipboard.writeText(key);
            UI.showNotification('Clave copiada al portapapeles', 'success');
        } catch (error) {
            console.error('Error copying cache key:', error);
            UI.showNotification('Error al copiar la clave', 'error');
        }
    },
    
    // Estimar uso de memoria
    estimateMemoryUsage() {
        if (!this.cacheStats || !this.cacheStats.keys) return 0;
        
        // Estimación simple: cada entrada usa aproximadamente 1KB
        const estimatedSizeKB = this.cacheStats.keys.length * 1;
        return (estimatedSizeKB / 1024).toFixed(2);
    },
    
    // Mostrar indicador de carga
    showLoading(show) {
        const entriesList = document.getElementById('cache-entries-list');
        if (entriesList) {
            if (show) {
                entriesList.innerHTML = `
                    <div class="loading-container">
                        <div class="loading"></div>
                        <p>Cargando estadísticas de caché...</p>
                    </div>
                `;
            }
        }
    },
    
    // Obtener rendimiento de caché
    getCachePerformance() {
        if (!this.cacheStats) {
            return {
                hitRate: 0,
                efficiency: 'Baja'
            };
        }
        
        const size = this.cacheStats.size || 0;
        const max = this.cacheStats.max || 100;
        const usagePercentage = (size / max) * 100;
        
        let efficiency = 'Baja';
        if (usagePercentage > 80) efficiency = 'Alta';
        else if (usagePercentage > 50) efficiency = 'Media';
        
        return {
            hitRate: 'N/A', // Se necesitaría más información para calcular esto
            efficiency,
            usagePercentage: Math.round(usagePercentage)
        };
    },
    
    // Generar reporte de caché
    generateCacheReport() {
        if (!this.cacheStats) {
            return 'No hay datos de caché disponibles';
        }
        
        const performance = this.getCachePerformance();
        const memoryUsage = this.estimateMemoryUsage();
        
        return `
            === REPORTE DE CACHÉ ===
            Fecha: ${new Date().toLocaleString()}
            
            ESTADÍSTICAS GENERALES:
            - Tamaño actual: ${this.cacheStats.size || 0} entradas
            - Tamaño máximo: ${this.cacheStats.max || 0} entradas
            - Uso de memoria: ${memoryUsage} MB
            - Eficiencia: ${performance.efficiency}
            - Porcentaje de uso: ${performance.usagePercentage}%
            
            ENTRADAS CACHEADAS:
            ${this.cacheStats.keys ? this.cacheStats.keys.map(key => `- ${key}`).join('\n') : 'No hay entradas'}
            
            === FIN DEL REPORTE ===
        `;
    },
    
    // Descargar reporte de caché
    downloadCacheReport() {
        const report = this.generateCacheReport();
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cache-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        UI.showNotification('Reporte descargado exitosamente', 'success');
    },
    
    // Monitorear salud de caché
    monitorCacheHealth() {
        if (!this.cacheStats) return;
        
        const size = this.cacheStats.size || 0;
        const max = this.cacheStats.max || 100;
        const usagePercentage = (size / max) * 100;
        
        // Alertas de uso alto
        if (usagePercentage > 90) {
            UI.showNotification('Advertencia: La caché está casi llena (90%+)', 'warning');
        }
        
        // Alertas de uso bajo
        if (usagePercentage < 10 && size > 0) {
            UI.showNotification('Info: La caché está subutilizada (<10%)', 'info');
        }
    },
    
    // Optimizar caché (placeholder para futura implementación)
    async optimizeCache() {
        UI.showNotification('Función de optimización en desarrollo', 'info');
    },
    
    // Configurar caché (placeholder para futura implementación)
    async configureCache() {
        UI.showNotification('Función de configuración en desarrollo', 'info');
    }
};

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Cache.init();
});

// Limpiar al salir de la página
window.addEventListener('beforeunload', () => {
    Cache.stopAutoRefresh();
});

// Exportar para uso global
window.Cache = Cache;

// Funciones globales para los botones
window.refreshCacheStats = () => Cache.loadCacheStats();
window.clearCache = () => Cache.clearCache();