const authMiddleware = require('../../src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const { Player } = require('../../src/models/player');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería retornar 401 si no hay token', () => {
    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Token no proporcionado'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería retornar 401 si el token es inválido', () => {
    mockReq.headers.authorization = 'Bearer invalid.token';

    // Mock de jwt.verify para que lance error
    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Token inválido'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería retornar 401 si el token está expirado', () => {
    mockReq.headers.authorization = 'Bearer expired.token';

    // Mock de jwt.verify para que lance error de expiración
    jwt.verify = jest.fn().mockImplementation(() => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      throw error;
    });

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Token expirado'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería retornar 401 si el usuario no existe', async () => {
    mockReq.headers.authorization = 'Bearer valid.token';

    // Mock de jwt.verify para que devuelva un payload válido
    jwt.verify = jest.fn().mockReturnValue({ id: 1, username: 'testuser' });

    // Mock de Player.findByPk para que devuelva null
    Player.findByPk = jest.fn().mockResolvedValue(null);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Token inválido'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería añadir req.user y llamar a next() si el token es válido', async () => {
    mockReq.headers.authorization = 'Bearer valid.token';

    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    };

    // Mock de jwt.verify para que devuelva un payload válido
    jwt.verify = jest.fn().mockReturnValue({ id: 1, username: 'testuser' });

    // Mock de Player.findByPk para que devuelva un usuario
    Player.findByPk = jest.fn().mockResolvedValue(mockUser);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockReq.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('debería manejar errores de base de datos', async () => {
    mockReq.headers.authorization = 'Bearer valid.token';

    // Mock de jwt.verify para que devuelva un payload válido
    jwt.verify = jest.fn().mockReturnValue({ id: 1, username: 'testuser' });

    // Mock de Player.findByPk para que lance error
    Player.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Error de autenticación'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería manejar tokens con formato Bearer', () => {
    mockReq.headers.authorization = 'Bearer valid.token';

    // Mock de jwt.verify para que lance error
    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('valid.token', expect.any(String));
  });

  it('debería manejar tokens sin formato Bearer', () => {
    mockReq.headers.authorization = 'valid.token';

    // Mock de jwt.verify para que lance error
    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('valid.token', expect.any(String));
  });
});