const trackingMiddleware = require('../../src/middleware/trackingMiddleware');
const { ApiStat } = require('../../src/models/apiStat');

describe('Tracking Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      path: '/api/test',
      method: 'GET',
      user: { id: 1 }
    };

    mockRes = {
      statusCode: 200,
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería llamar a next()', () => {
    trackingMiddleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('debería sobrescribir res.json', () => {
    const originalJson = mockRes.json;
    trackingMiddleware(mockReq, mockRes, mockNext);
    
    expect(mockRes.json).not.toBe(originalJson);
    expect(typeof mockRes.json).toBe('function');
  });

  it('debería registrar estadísticas cuando se llama a res.json', async () => {
    // Mock de ApiStat.findOne y ApiStat.create
    ApiStat.findOne = jest.fn().mockResolvedValue(null);
    ApiStat.create = jest.fn().mockResolvedValue({});

    trackingMiddleware(mockReq, mockRes, mockNext);

    // Simular llamada a res.json
    const testData = { message: 'test' };
    await mockRes.json(testData);

    expect(ApiStat.findOne).toHaveBeenCalledWith({
      where: {
        endpointAccess: '/api/test',
        requestMethod: 'GET',
        statusCode: 200,
      },
    });

    expect(ApiStat.create).toHaveBeenCalledWith({
      endpointAccess: '/api/test',
      requestMethod: 'GET',
      statusCode: 200,
      requestCount: 1,
      responseTimeAvg: expect.any(Number),
      responseTimeMin: expect.any(Number),
      responseTimeMax: expect.any(Number),
      timestamp: expect.any(Date),
      userId: 1,
    });
  });

  it('debería manejar errores sin romper la aplicación', async () => {
    // Mock de ApiStat.findOne que lanza error
    ApiStat.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

    trackingMiddleware(mockReq, mockRes, mockNext);

    // Simular llamada a res.json - no debería lanzar error
    const testData = { message: 'test' };
    await expect(mockRes.json(testData)).resolves.not.toThrow();
  });

  it('debería funcionar sin usuario autenticado', async () => {
    mockReq.user = null;
    
    ApiStat.findOne = jest.fn().mockResolvedValue(null);
    ApiStat.create = jest.fn().mockResolvedValue({});

    trackingMiddleware(mockReq, mockRes, mockNext);

    const testData = { message: 'test' };
    await mockRes.json(testData);

    expect(ApiStat.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null
      })
    );
  });

  it('debería actualizar registro existente', async () => {
    const existingStat = {
      id: 1,
      requestCount: 5,
      responseTimeAvg: 100,
      responseTimeMin: 50,
      responseTimeMax: 200
    };

    ApiStat.findOne = jest.fn().mockResolvedValue(existingStat);
    ApiStat.update = jest.fn().mockResolvedValue([1]);

    trackingMiddleware(mockReq, mockRes, mockNext);

    const testData = { message: 'test' };
    await mockRes.json(testData);

    expect(ApiStat.update).toHaveBeenCalledWith(
      expect.objectContaining({
        requestCount: 6,
        userId: 1
      }),
      { where: { id: 1 } }
    );
  });
});