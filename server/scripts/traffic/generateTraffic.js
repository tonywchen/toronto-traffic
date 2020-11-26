/**
 * This is the main job that periodically fetches transit
 * route/stops/directions/predictions data from Nextbus
 * API.
 */
const mongoose = require('mongoose');
const Agenda = require('Agenda');

const convertPredictions = require('./convertPredictions');
const computePathData = require('./computePathData');

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

  agenda.define('GENERATE_TRAFFIC', async () => {
    const traffic = await convertPredictions('504');
    await computePathData(traffic)
  });
};

const run = async () => {
  await agenda.start();
  // await agenda.every('5 minutes', 'GENERATE_TRAFFIC');
  await agenda.now('GENERATE_TRAFFIC');
}

(async () => {
  await initialize();
  await run();
})();
