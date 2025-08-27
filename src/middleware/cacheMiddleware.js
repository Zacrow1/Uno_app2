const NodeCache = require('node-cache');

// Configurar caché con TTL de 10 minutos
const cache = new NodeCache({
  stdTTL: 600, // 10 minutos
  checkperiod: 120, // Verificar cada 2 minutos
  useClones: false
});

const cacheMiddleware = (keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      // Generar clave de caché
      let cacheKey;
      if (typeof keyGenerator === 'function') {
        cacheKey = keyGenerator(req);
      } else {
        // Clave por defecto basada en URL y método
        cacheKey = `${req.method}:${req.originalUrl}`;
      }

      // Verificar si la respuesta está en caché
      const cachedResponse = cache.get(cacheKey);
      if (cachedResponse) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return res.json(cachedResponse);
      }

      // Sobrescribir res.json para almacenar la respuesta en caché
      const originalJson = res.json;
      res.json = function(data) {
        // Almacenar en caché solo respuestas exitosas
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Cache miss for key: ${cacheKey}`);
          cache.set(cacheKey, data);
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Error en middleware de caché:', error);
      next();
    }
  };
};

// Funciones de utilidad para la caché
const cacheUtils = {
  // Limpiar toda la caché
  clear: () => {
    cache.flushAll();
    console.log('Cache cleared');
  },

  // Limpiar clave específica
  clearKey: (key) => {
    cache.del(key);
    console.log(`Cache key cleared: ${key}`);
  },

  // Obtener estadísticas de la caché
  getStats: () => {
    return cache.getStats();
  },

  // Obtener todas las claves
  getKeys: () => {
    return cache.keys();
  },

  // Obtener valor de una clave
  get: (key) => {
    return cache.get(key);
  },

  // Establecer valor manualmente
  set: (key, value, ttl = null) => {
    if (ttl) {
      cache.set(key, value, ttl);
    } else {
      cache.set(key, value);
    }
  },

  // Eliminar clave
  delete: (key) => {
    return cache.del(key);
  },

  // Verificar si existe una clave
  has: (key) => {
    return cache.has(key);
  }
};

module.exports = {
  cacheMiddleware,
  cacheUtils
};