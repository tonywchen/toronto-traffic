const router = require('express').Router();

const TrafficService = require('../services/Traffic');
const TrafficServiceInstance = new TrafficService();

router.get('/traffic', async (req, res) => {
  // by default, grab the most recent hourly traffic
  const traffic = await TrafficServiceInstance.findRecent();

  res.send(traffic);
});

module.exports = router;
