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
    console.error(e.stack);
    res.status(400).send({ error: e.message });
  }

});

router.get('/paths', async (req, res) => {
  try {
    const paths = await TrafficServiceInstance.getPaths();
    res.send(paths);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send({ error: e.message });
  }
})

module.exports = router;
