const NextbusService = require('../../../services/Nextbus');
const Trip = require('../../../models/nextbus/Trip');
const Stop = require('../../../models/nextbus/Stop');
const Vehicle = require('../../../models/nextbus/Vehicle');

const getCurrentTimestamp = () => {
  return new Date().getTime();
};

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

  const currentTimestamp = getCurrentTimestamp();

  const stops = await findRouteStops(routeTag);

  const { groups } = await NextbusService.fetchPredictions(routeTag, '', stops, currentTimestamp);
  for (const groupKey of Object.keys(groups)) {
    const trip = groups[groupKey];

    const tripObj = new Trip(trip);
    await tripObj.save();
  };

  const vehicles = await NextbusService.fetchVehicles(routeTag);
  for (const vehicle of vehicles) {
    const vehicleObj = new Vehicle({
      ...vehicle,
      timestamp: currentTimestamp
    });
    await vehicleObj.save();
  }
};

module.exports = {
  name: 'JOB_TRIPS',
  fetch: fetchTrips
};
