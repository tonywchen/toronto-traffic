const router = require('express').Router();

router.get('/traffic', async (req, res) => {
  const { from, to } = req.query;

  if (from && to) {
    // get historical data
  } else {
    // get most recent data
  }

  res.send([]);
});
module.exports = router;
