const router = require('express').Router();

const PathService = require('../services/Path');

router.get('/paths', async (req, res) => {
  try {
    const paths = await PathService.getPaths();
    res.send(paths);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

module.exports = router;
