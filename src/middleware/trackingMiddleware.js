const { ApiStat } = require('../models/apiStat');

const trackingMiddleware = async (req, res, next) => {
  const startTime = Date.now();
  
  // Sobrescribir el método res.json para capturar la respuesta
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Registrar la estadística de forma asíncrona
    trackRequest(req, res, responseTime).catch(error => {
      console.error('Error al registrar estadística:', error);
    });
    
    return originalJson.call(this, data);
  };
  
  next();
};

async function trackRequest(req, res, responseTime) {
  try {
    const endpointAccess = req.path;
    const requestMethod = req.method;
    const statusCode = res.statusCode;
    
    // Obtener user ID si está disponible
    const userId = req.user?.id || null;

    // Buscar si ya existe un registro para este endpoint
    const existingTracking = await ApiStat.findOne({
      where: {
        endpointAccess,
        requestMethod,
        statusCode,
      },
    });

    if (existingTracking) {
      // Actualizar registro existente
      const newCount = existingTracking.requestCount + 1;
      const newAvg = (existingTracking.responseTimeAvg * existingTracking.requestCount + responseTime) / newCount;
      const newMin = Math.min(existingTracking.responseTimeMin, responseTime);
      const newMax = Math.max(existingTracking.responseTimeMax, responseTime);

      await ApiStat.update({
        requestCount: newCount,
        responseTimeAvg: newAvg,
        responseTimeMin: newMin,
        responseTimeMax: newMax,
        timestamp: new Date(),
        userId,
      }, {
        where: { id: existingTracking.id }
      });
    } else {
      // Crear nuevo registro
      await ApiStat.create({
        endpointAccess,
        requestMethod,
        statusCode,
        requestCount: 1,
        responseTimeAvg: responseTime,
        responseTimeMin: responseTime,
        responseTimeMax: responseTime,
        timestamp: new Date(),
        userId,
      });
    }
  } catch (error) {
    console.error('Error al registrar solicitud:', error);
  }
}

module.exports = trackingMiddleware;