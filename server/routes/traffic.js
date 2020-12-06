const router = require('express').Router();

const TrafficService = require('../services/Traffic');
const TrafficServiceInstance = new TrafficService();

router.get('/traffic', async (req, res) => {
  let { from, to } = req.query;
  from = parseInt(from, 0);
  to = parseInt(to, 0);

  try {
    const traffic = await TrafficServiceInstance.searchBetween(from, to);
    res.send(traffic);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }

});

module.exports = router;
