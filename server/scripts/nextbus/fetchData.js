/**
 * This is the main job that periodically fetches transit
 * route/stops/directions/predictions data from Nextbus
 * API.
 */
const mongoose = require('mongoose');
const Agenda = require('Agenda');

const fetchRoute = require('./fetchRoute');
const fetchTrips = require('./fetchTrips');
const jobs = [{
  name: fetchRoute.name,
  fetch: fetchRoute.fetch,
  interval: '1 day',
  active: true,
  params: {
    routeTag: 504
  }
}, {
  name: fetchTrips.name,
  fetch: fetchTrips.fetch,
  interval: '1 minute',
  active: true,
  params: {
    routeTag: 504
  }
}];

let agenda;
const initialize = async () => {
  mongoose.connect('mongodb://localhost:27017/toronto-traffic');
  agenda = new Agenda({
    db: {
      address: 'mongodb://localhost:27017/agenda'
    }
  });

  agenda.on('fail', (err) => {
    console.error(`Job failed with error: ${err.stack}`);
  });

  for (const { name, fetch, active } of jobs) {
    if (active) {
      agenda.define(name, fetch);
    }
  }
};

const run = async () => {
  await agenda.start();
  for (const { interval, name, active, params } of jobs) {
    if (active) {
      await agenda.every(interval, name, params);
    }
  }
}

(async () => {
  await initialize();
  await run();
})();

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
