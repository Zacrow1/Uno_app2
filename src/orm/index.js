const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../db/custom.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    paranoid: false
  }
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  }
};

// Función para sincronizar modelos
const syncModels = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados correctamente.');
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
    process.exit(1);
  }
};

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  await testConnection();
  await syncModels();
};

module.exports = {
  sequelize,
  DataTypes,
  testConnection,
  syncModels,
  initializeDatabase
};