const router = require('express').Router();

const TrafficService = require('../services/Traffic');
const TrafficServiceInstance = new TrafficService();

const PathService = require('../services/Path');
const PathServiceInstance = new PathService();

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
});


router.get('/paths/:from/to/:to', async (req, res) => {
  const { from, to } = req.params;
  const { date } = req.query;
  // 23889, 23887
  try {
    const pathDetail = await PathServiceInstance.getPathDetail(from, to, date);
    res.send(pathDetail);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send({ error: e.message });
  }
});

module.exports = router;
