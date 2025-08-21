import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import cardsRoutes from './routes/cardsRoutes.js';
import gamesRoutes from './routes/gamesRoutes.js';
import playerCardRoutes from './routes/playerCardRoutes.js';
import playersRoutes from './routes/playersRoutes.js';
import scoresRoutes from './routes/scoresRoutes.js';
import cacheMiddleware, { cacheUtils, noCache } from './middleware/cacheMiddleware.js';

const app = express();
const port = process.env.PORT || 3000;

// Configuración del middleware de caché
const cacheConfig = {
  max: parseInt(process.env.CACHE_MAX) || 100,           // Máximo 100 entradas
  maxAge: parseInt(process.env.CACHE_MAX_AGE) || 60000,   // Expirar después de 1 minuto
  enabled: process.env.CACHE_ENABLED !== 'false',        // Habilitado por defecto
  debug: process.env.CACHE_DEBUG === 'true'              // Debug deshabilitado por defecto
};

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Middleware de caché global (se aplica a todas las rutas GET)
app.use((req, res, next) => {
  // Solo aplicar caché a métodos GET y OPTIONS
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    return cacheMiddleware(cacheConfig)(req, res, next);
  }
  next();
});

// Rutas de la API
app.use('/api/players', playersRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api', playerCardRoutes);

// Rutas para gestión de caché (solo en entorno de desarrollo o con variable de entorno)
if (process.env.NODE_ENV === 'development' || process.env.CACHE_MANAGEMENT_ENABLED === 'true') {
  
  // Ruta para limpiar toda la caché
  app.post('/api/cache/clear', (req, res) => {
    cacheUtils.clear();
    res.json({ message: 'Cache cleared successfully' });
  });

  // Ruta para obtener estadísticas de caché
  app.get('/api/cache/stats', (req, res) => {
    const stats = cacheUtils.getStats();
    res.json(stats);
  });

  // Ruta para eliminar una entrada específica de caché
  app.delete('/api/cache/:key', (req, res) => {
    const { key } = req.params;
    cacheUtils.delete(key);
    res.json({ message: `Cache entry '${key}' deleted successfully` });
  });

  // Ruta para reconfigurar caché
  app.post('/api/cache/reconfigure', (req, res) => {
    const { max, maxAge, enabled } = req.body;
    const newConfig = { max, maxAge, enabled };
    cacheUtils.reconfigure(newConfig);
    res.json({ message: 'Cache reconfigured successfully', config: newConfig });
  });
}

// Rutas que no deben usar caché (usar noCache middleware)
app.get('/api/health', noCache, (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cache: cacheUtils.getStats()
  });
});

// Middleware para invalidar caché cuando se realizan cambios
app.use('/api/players', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    // Invalidar caché relacionada con jugadores
    setTimeout(() => {
      cacheUtils.delete('GET:/api/players');
      cacheUtils.delete('GET:/api/games');
    }, 0);
  }
  next();
}, playersRoutes);

app.use('/api/games', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    // Invalidar caché relacionada con juegos
    setTimeout(() => {
      cacheUtils.delete('GET:/api/games');
      cacheUtils.delete('GET:/api/players');
    }, 0);
  }
  next();
}, gamesRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Función para cerrar la aplicación limpiamente
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Cleaning up...');
  
  // Limpiar caché y temporizadores
  if (cacheUtils) {
    cacheUtils.clear();
  }
  
  process.exit(0);
};

// Escuchar señales de terminación
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Only start the server if this file is run directly
if (process.argv[1] && process.argv[1].endsWith('app.js')) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Cache middleware enabled: ${cacheConfig.enabled}`);
    console.log(`Cache max entries: ${cacheConfig.max}`);
    console.log(`Cache max age: ${cacheConfig.maxAge}ms`);
    
    if (cacheConfig.debug) {
      console.log('Cache debug mode enabled');
    }
  });
}

export default app;