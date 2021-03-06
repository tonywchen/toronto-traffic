const NextbusService = require('../../../services/Nextbus');
const Stop = require('../../../models/nextbus/Stop');
const Subroute = require('../../../models/nextbus/Subroute');

const fetchRoute = async (job) => {
  const { routeTag } = job.attrs.data;
  if (!routeTag) {
    console.warning(`[fetchRoute.js] No ${routeTag} provided`);
    return;
  }

  const { stops, directions } = await NextbusService.fetchRoute(routeTag);

  await Stop.updateMany({ routeTag }, { $set: { enabled: false } });

  for (const stop of stops) {
    const filter = {
      tag: stop.tag
    };

    await Stop.findOneAndUpdate(filter, {
      ...stop,
      enabled: true
    }, {
      new: true,
      upsert: true
    });
  }

  for (const direction of directions) {
    const filter = {
      tag: direction.tag
    };

    await Subroute.findOneAndUpdate(filter, direction, {
      new: true,
      upsert: true
    });
  }
};

module.exports = {
  name: 'JOB_ROUTE',
  fetch: fetchRoute
};
