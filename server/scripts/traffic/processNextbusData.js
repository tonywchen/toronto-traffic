/**
 * This is the main job that periodically fetches transit
 * route/stops/directions/predictions data from Nextbus
 * API.
 */
const mongoose = require('mongoose');
const Agenda = require('agenda');

const convertPredictions = require('./parts/convertPredictions');
const computePathData = require('./parts/computePathData');

const JOB_PROCESS_NEXTBUS_DATA = 'PROCESS_NEXTBUS_DATA';

let agenda;
const initialize = async () => {
  mongoose.connect('mongodb://localhost:27017/toronto-traffic', {
    // useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  agenda = new Agenda({
    db: {
      address: 'mongodb://localhost:27017/agenda'
    }
  });

  agenda.on('fail', (err) => {
    console.error(`Job failed with error: ${err.stack}`);
  });

  agenda.define(JOB_PROCESS_NEXTBUS_DATA, async () => {
    const { trafficGroups, maxTimestamp } = await convertPredictions('504');
    await computePathData(trafficGroups, maxTimestamp);
  });
};

const run = async () => {
  await agenda.start();
  await agenda.every('10 minutes', JOB_PROCESS_NEXTBUS_DATA);
}

(async () => {
  await initialize();
  await run();
})();
