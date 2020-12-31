const router = require('express').Router();
const moment = require('moment-timezone');

const TrafficService = require('../services/Traffic');

router.get('/traffic', async (req, res) => {
  let { fromDate, toDate } = req.query;

  try {
    const momentFrom = moment(fromDate);
    const momentTo = moment(toDate);

    if (!momentFrom.isValid() || !momentTo.isValid()) {
      throw new Error('Invalid dates are given');
    }
    if (momentFrom.isAfter(momentTo)) {
      throw new Error('"fromDate" must not be larger than "toDate"');
    }

    const traffic = await TrafficService.searchBetween(fromDate, toDate);
    res.send(traffic);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

module.exports = router;
