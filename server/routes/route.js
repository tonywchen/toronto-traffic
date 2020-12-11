const router = require('express').Router();

const RouteService = require('../services/Route');
const RouteServiceInstance = new RouteService();

router.get('/subroutes', async (req, res) => {
  try {
    const result = await RouteServiceInstance.getSubroutes();
    res.send(result);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

module.exports = router;
