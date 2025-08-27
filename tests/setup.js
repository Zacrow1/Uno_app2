const { sequelize } = require('../src/database/database');
const { initializeDatabase } = require('../src/database/init');

// Antes de todas las pruebas
beforeAll(async () => {
  // Inicializar base de datos para pruebas
  await initializeDatabase();
});

// Después de todas las pruebas
afterAll(async () => {
  // Cerrar conexión a la base de datos
  await sequelize.close();
});

// Antes de cada prueba
beforeEach(async () => {
  // Limpiar tablas (opcional)
  // await sequelize.sync({ force: true });
});

// Después de cada prueba
afterEach(async () => {
  // Limpiar datos de prueba (opcional)
});