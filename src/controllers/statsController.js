const { ApiStat } = require('../models/apiStat');

class StatsController {
  async getRequests(req, res) {
    try {
      const trackingData = await ApiStat.findAll({
        order: [['timestamp', 'DESC']]
      });

      const totalRequests = trackingData.reduce((sum, item) => sum + item.requestCount, 0);

      const breakdown = trackingData.reduce((acc, item) => {
        const endpoint = item.endpointAccess;
        const method = item.requestMethod;

        if (!acc[endpoint]) {
          acc[endpoint] = {};
        }

        if (!acc[endpoint][method]) {
          acc[endpoint][method] = 0;
        }

        acc[endpoint][method] += item.requestCount;

        return acc;
      }, {});

      res.json({
        total_requests: totalRequests,
        breakdown
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de solicitudes:', error);
      res.status(500).json({
        error: 'Error interno al obtener estadísticas de solicitudes'
      });
    }
  }

  async getResponseTimes(req, res) {
    try {
      const trackingData = await ApiStat.findAll({
        order: [['timestamp', 'DESC']]
      });

      const responseTimes = trackingData.reduce((acc, item) => {
        const endpoint = item.endpointAccess;

        if (!acc[endpoint]) {
          acc[endpoint] = {
            avg: 0,
            min: Infinity,
            max: 0,
            totalRequests: 0,
            totalTime: 0,
          };
        }

        const endpointData = acc[endpoint];

        endpointData.min = Math.min(endpointData.min, item.responseTimeMin);
        endpointData.max = Math.max(endpointData.max, item.responseTimeMax);
        endpointData.totalTime += item.responseTimeAvg * item.requestCount;
        endpointData.totalRequests += item.requestCount;
        endpointData.avg = endpointData.totalTime / endpointData.totalRequests;

        return acc;
      }, {});

      const formattedResponse = Object.entries(responseTimes).reduce((acc, [endpoint, data]) => {
        acc[endpoint] = {
          avg: Math.round(data.avg * 100) / 100,
          min: Math.round(data.min * 100) / 100,
          max: Math.round(data.max * 100) / 100,
        };
        return acc;
      }, {});

      res.json(formattedResponse);
    } catch (error) {
      console.error('Error al obtener estadísticas de tiempos de respuesta:', error);
      res.status(500).json({
        error: 'Error interno al obtener estadísticas de tiempos de respuesta'
      });
    }
  }

  async getStatusCodes(req, res) {
    try {
      const trackingData = await ApiStat.findAll({
        order: [['timestamp', 'DESC']]
      });

      const statusCodes = trackingData.reduce((acc, item) => {
        const statusCode = item.statusCode.toString();

        if (!acc[statusCode]) {
          acc[statusCode] = 0;
        }

        acc[statusCode] += item.requestCount;

        return acc;
      }, {});

      res.json(statusCodes);
    } catch (error) {
      console.error('Error al obtener estadísticas de códigos de estado:', error);
      res.status(500).json({
        error: 'Error interno al obtener estadísticas de códigos de estado'
      });
    }
  }

  async getPopularEndpoints(req, res) {
    try {
      const trackingData = await ApiStat.findAll({
        order: [['timestamp', 'DESC']]
      });

      const endpointCounts = trackingData.reduce((acc, item) => {
        const endpoint = item.endpointAccess;

        if (!acc[endpoint]) {
          acc[endpoint] = 0;
        }

        acc[endpoint] += item.requestCount;

        return acc;
      }, {});

      let mostPopular = '';
      let requestCount = 0;

      Object.entries(endpointCounts).forEach(([endpoint, count]) => {
        if (count > requestCount) {
          mostPopular = endpoint;
          requestCount = count;
        }
      });

      res.json({
        most_popular: mostPopular,
        request_count: requestCount,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de endpoints populares:', error);
      res.status(500).json({
        error: 'Error interno al obtener estadísticas de endpoints populares'
      });
    }
  }
}

module.exports = new StatsController();