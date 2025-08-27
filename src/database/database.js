const { Sequelize } = require('sequelize');
const path = require('path');

// Crear instancia de Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../db/custom.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

// Exportar la instancia de Sequelize
module.exports = {
  sequelize,
  testConnection
};