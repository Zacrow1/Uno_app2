const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initializeDatabase } = require('./database/init');

// Importar rutas
const playersRoutes = require('./routes/playersRoutes');
const gamesRoutes = require('./routes/gamesRoutes');
const scoresRoutes = require('./routes/scoresRoutes');
const cardsRoutes = require('./routes/cardsRoutes');
const playerCardRoutes = require('./routes/playerCardRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Importar middlewares
const { cacheMiddleware, cacheUtils } = require('./middleware/cacheMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y logging
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de caché para respuestas estáticas
app.use(cacheMiddleware((req) => `static:${req.originalUrl}`));

// Rutas de la API
app.use('/api/players', playersRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/player-cards', playerCardRoutes);
app.use('/api/stats', statsRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de información del cache
app.get('/api/cache/info', (req, res) => {
  res.json({
    stats: cacheUtils.getStats(),
    keys: cacheUtils.getKeys()
  });
});

// Ruta para limpiar cache
app.post('/api/cache/clear', (req, res) => {
  cacheUtils.clear();
  res.json({ message: 'Cache cleared successfully' });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Inicializar base de datos
    await initializeDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🎮 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

// Iniciar el servidor si este archivo es ejecutado directamente
if (require.main === module) {
  startServer();
}

module.exports = app;