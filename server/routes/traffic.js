const router = require('express').Router();
const moment = require('moment-timezone');

const TrafficService = require('../services/Traffic');

router.get('/traffic', async (req, res) => {
  let { startDate, endDate } = req.query;

  try {
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);

    if (!startMoment.isValid() || !endMoment.isValid()) {
      throw new Error('Invalid dates are given');
    }
    if (startMoment.isAfter(endMoment)) {
      throw new Error('"startDate" must not be larger than "endDate"');
    }

    const startTimestamp = (startDate)? startMoment.valueOf() : null;
    const endTimestamp = (endDate)? endMoment.valueOf() : null;

    const traffic = await TrafficService.searchBetween(startTimestamp, endTimestamp);
    res.send(traffic);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

module.exports = router;
