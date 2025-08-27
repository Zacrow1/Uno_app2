const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Player } = require('../models/player');
const { ApiStat } = require('../models/apiStat');

// JWT Secret - debería estar en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_ultra_seguro';

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Validar campos requeridos
      if (!username || !email || !password) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: username, email, password'
        });
      }

      // Verificar si el usuario ya existe
      const existingPlayer = await Player.findOne({
        where: {
          $or: [
            { email },
            { username }
          ]
        }
      });

      if (existingPlayer) {
        return res.status(409).json({
          error: 'El usuario ya existe'
        });
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear el jugador
      const player = await Player.create({
        username,
        email,
        password: hashedPassword
      });

      // Generar token JWT
      const token = jwt.sign(
        { id: player.id, username: player.username },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: player.id,
          username: player.username,
          email: player.email
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        error: 'Error interno al registrar usuario'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar campos requeridos
      if (!email || !password) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: email, password'
        });
      }

      // Buscar usuario por email
      const player = await Player.findOne({ where: { email } });
      if (!player) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, player.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: player.id, username: player.username },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: player.id,
          username: player.username,
          email: player.email
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: 'Error interno al iniciar sesión'
      });
    }
  }

  async logout(req, res) {
    try {
      // En una implementación real, podrías invalidar el token
      // Por ahora, simplemente respondemos con éxito
      res.json({
        message: 'Logout exitoso'
      });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        error: 'Error interno al cerrar sesión'
      });
    }
  }

  async profile(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          error: 'Token no proporcionado'
        });
      }

      // Verificar token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Buscar usuario
      const player = await Player.findByPk(decoded.id);
      if (!player) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        id: player.id,
        username: player.username,
        email: player.email,
        createdAt: player.createdAt
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Token inválido'
        });
      }
      console.error('Error en perfil:', error);
      res.status(500).json({
        error: 'Error interno al obtener perfil'
      });
    }
  }
}

module.exports = new AuthController();