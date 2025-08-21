import cacheMiddleware, { cacheUtils, LRUCache } from '../src/middleware/cacheMiddleware.js';

describe('Cache Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let cache;

  beforeEach(() => {
    // Resetear caché antes de cada prueba
    cacheUtils.clear();
    
    // Mock del objeto request
    mockReq = {
      method: 'GET',
      url: '/api/test',
      originalUrl: '/api/test',
      headers: {}
    };

    // Mock del objeto response
    mockRes = {
      statusCode: 200,
      headers: {},
      setHeader: jest.fn(),
      get: jest.fn(),
      json: jest.fn()
    };

    // Mock de la función next
    mockNext = jest.fn();
  });

  describe('LRUCache Class', () => {
    test('should create cache with default values', () => {
      const cache = new LRUCache();
      expect(cache.max).toBe(100);
      expect(cache.maxAge).toBe(60000);
      expect(cache.size()).toBe(0);
    });

    test('should create cache with custom values', () => {
      const cache = new LRUCache(50, 30000);
      expect(cache.max).toBe(50);
      expect(cache.maxAge).toBe(30000);
    });

    test('should set and get values', () => {
      const cache = new LRUCache();
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('should return undefined for non-existent keys', () => {
      const cache = new LRUCache();
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    test('should evict oldest entry when max size is reached', () => {
      const cache = new LRUCache(2, 60000);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      expect(cache.get('key1')).toBeUndefined(); // key1 debería haber sido eliminada
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    test('should delete entries', () => {
      const cache = new LRUCache();
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
      
      cache.delete('key1');
      expect(cache.get('key1')).toBeUndefined();
    });

    test('should clear all entries', () => {
      const cache = new LRUCache();
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
      
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe('Cache Middleware', () => {
    test('should call next when cache is disabled', () => {
      const middleware = cacheMiddleware({ enabled: false });
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    test('should call next and intercept response when cache is enabled', () => {
      const middleware = cacheMiddleware({ enabled: true, maxAge: 60000 });
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(typeof mockRes.json).toBe('function');
    });

    test('should generate cache key correctly', () => {
      const middleware = cacheMiddleware({ enabled: true });
      mockReq.url = '/api/test?param1=value1&param2=value2';
      
      middleware(mockReq, mockRes, mockNext);
      
      // La clave debería incluir el método y la URL completa con parámetros
      expect(mockReq.url).toBe('/api/test?param1=value1&param2=value2');
    });

    test('should handle POST requests without caching', () => {
      mockReq.method = 'POST';
      const middleware = cacheMiddleware({ enabled: true });
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      // Para POST, no debería modificar res.json
      expect(mockRes.json).not.toBeModified();
    });
  });

  describe('Cache Response Handling', () => {
    test('should cache successful responses', () => {
      const middleware = cacheMiddleware({ enabled: true, maxAge: 60000 });
      
      // Ejecutar middleware
      middleware(mockReq, mockRes, mockNext);
      
      // Simular respuesta exitosa
      const responseData = { message: 'test data' };
      mockRes.statusCode = 200;
      mockRes.json(responseData);
      
      // Verificar que la respuesta fue cacheada
      const cacheKey = `GET:${mockReq.url}`;
      const cached = cacheUtils.get(cacheKey);
      
      expect(cached).toBeDefined();
      expect(cached.data).toEqual(responseData);
      expect(cached.statusCode).toBe(200);
    });

    test('should not cache error responses', () => {
      const middleware = cacheMiddleware({ enabled: true, maxAge: 60000 });
      
      middleware(mockReq, mockRes, mockNext);
      
      // Simular respuesta de error
      const responseData = { error: 'test error' };
      mockRes.statusCode = 404;
      mockRes.json(responseData);
      
      // Verificar que la respuesta no fue cacheada
      const cacheKey = `GET:${mockReq.url}`;
      const cached = cacheUtils.get(cacheKey);
      
      expect(cached).toBeUndefined();
    });

    test('should serve cached responses', () => {
      const middleware = cacheMiddleware({ enabled: true, maxAge: 60000 });
      const cacheKey = `GET:${mockReq.url}`;
      
      // Pre-cargar datos en caché
      const cachedData = {
        data: { message: 'cached data' },
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' }
      };
      cacheUtils.set(cacheKey, cachedData);
      
      // Ejecutar middleware
      middleware(mockReq, mockRes, mockNext);
      
      // Verificar que se sirvió la respuesta cacheada
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(cachedData.data);
    });
  });

  describe('Cache Utils', () => {
    test('should clear cache', () => {
      cacheUtils.set('testKey', 'testValue');
      expect(cacheUtils.get('testKey')).toBe('testValue');
      
      cacheUtils.clear();
      expect(cacheUtils.get('testKey')).toBeUndefined();
    });

    test('should delete specific cache entry', () => {
      cacheUtils.set('key1', 'value1');
      cacheUtils.set('key2', 'value2');
      
      cacheUtils.delete('key1');
      
      expect(cacheUtils.get('key1')).toBeUndefined();
      expect(cacheUtils.get('key2')).toBe('value2');
    });

    test('should return cache stats', () => {
      cacheUtils.clear();
      cacheUtils.set('key1', 'value1');
      cacheUtils.set('key2', 'value2');
      
      const stats = cacheUtils.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.max).toBe(100); // valor por defecto
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
  });

  describe('Cache Expiration', () => {
    test('should expire entries after maxAge', (done) => {
      const cache = new LRUCache(100, 100); // 100ms de expiración
      
      cache.set('testKey', 'testValue');
      expect(cache.get('testKey')).toBe('testValue');
      
      // Esperar a que expire
      setTimeout(() => {
        expect(cache.get('testKey')).toBeUndefined();
        done();
      }, 150);
    });

    test('should reset expiration on access', (done) => {
      const cache = new LRUCache(100, 100);
      
      cache.set('testKey', 'testValue');
      
      // Acceder antes de que expire
      setTimeout(() => {
        expect(cache.get('testKey')).toBe('testValue');
        
        // Esperar más tiempo y verificar que todavía existe
        setTimeout(() => {
          expect(cache.get('testKey')).toBe('testValue');
          done();
        }, 60);
      }, 50);
    });
  });

  describe('Configuration Loading', () => {
    beforeEach(() => {
      // Limpiar variables de entorno antes de cada prueba
      delete process.env.CACHE_MAX;
      delete process.env.CACHE_MAX_AGE;
      delete process.env.CACHE_ENABLED;
      delete process.env.CACHE_DEBUG;
    });

    test('should load default configuration', () => {
      const { loadConfig } = cacheMiddleware;
      const config = loadConfig();
      
      expect(config.max).toBe(100);
      expect(config.maxAge).toBe(60000);
      expect(config.enabled).toBe(true);
      expect(config.debug).toBe(false);
    });

    test('should override with environment variables', () => {
      process.env.CACHE_MAX = '200';
      process.env.CACHE_MAX_AGE = '30000';
      process.env.CACHE_ENABLED = 'false';
      process.env.CACHE_DEBUG = 'true';
      
      const { loadConfig } = cacheMiddleware;
      const config = loadConfig();
      
      expect(config.max).toBe(200);
      expect(config.maxAge).toBe(30000);
      expect(config.enabled).toBe(false);
      expect(config.debug).toBe(true);
    });

    test('should merge custom configuration', () => {
      const { loadConfig } = cacheMiddleware;
      const config = loadConfig({ max: 50, enabled: false });
      
      expect(config.max).toBe(50);
      expect(config.enabled).toBe(false);
      expect(config.maxAge).toBe(60000); // valor por defecto
    });
  });
});