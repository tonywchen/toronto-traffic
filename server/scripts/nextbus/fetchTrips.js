const Nextbus = require('../../services/Nextbus');
const Trip = require('../../models/nextbus/Trip');
const Stop = require('../../models/nextbus/Stop');

const nextbusService = Nextbus();

const findRouteStops = async (routeTag) => {
  const stops = await Stop.find({
    routeTag
  });

  return stops;
};

const fetchTrips = async (job) => {
  const { routeTag } = job.attrs.data;
  if (!routeTag) {
    console.warning(`[fetchTrips.js] No ${routeTag} provided`);
    return;
  }

  const stops = await findRouteStops(routeTag);
  const { groups } = await nextbusService.fetchPredictions(routeTag, '', stops);

  let tripSize = 0;
  for (const groupKey of Object.keys(groups)) {
    const trip = groups[groupKey];

    const tripObj = new Trip(trip);
    await tripObj.save();

    tripSize++;
  };
  console.log(`[${new Date()}] - ${tripSize} trips`);
};

module.exports = {
  name: 'JOB_TRIPS',
  fetch: fetchTrips
};

/**
 * size: 10119450
 * count: 3513
 * storageSize: 3153920
 * avgObjSize: 2880
 */
3203072 - 3153920
/**
 * size: 10279807
 * count: 3602,
 * storageSize: 3203072,
 * avgObjSize: 2853
 */
