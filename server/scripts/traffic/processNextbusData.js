/**
 * This is the main job that periodically fetches transit
 * route/stops/directions/predictions data from Nextbus
 * API.
 */
const mongoose = require('mongoose');
const Agenda = require('agenda');

const convertPredictions = require('./parts/convertPredictions');
const computePathData = require('./parts/computePathData');

// should accept the following command line arguments:
// --now    - to run the script now
const yargs = require('yargs/yargs');
const argv = yargs(process.argv).argv;

const JOB_PROCESS_NEXTBUS_DATA = 'PROCESS_NEXTBUS_DATA';

let agenda;
const initialize = async () => {
  process.on('SIGTERM', graceful);
  process.on('SIGINT' , graceful);

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
};

const define = () => {
  agenda.define(
    JOB_PROCESS_NEXTBUS_DATA,
    {
      concurrency: 1,
      lockLifetime: 15 * 60 * 1000 // 15 minutes
    },
    async () => {
      const { trafficGroups, maxTimestamp } = await convertPredictions('504');
      await computePathData(trafficGroups, maxTimestamp);
    }
  );
};

const run = async () => {
  await agenda.start();

  if (argv.now) {
    await agenda.now(JOB_PROCESS_NEXTBUS_DATA);
  } else {
    await agenda.every('15 minutes', JOB_PROCESS_NEXTBUS_DATA);
  }
}

const graceful = async () => {
  if (agenda) {
    await agenda.stop();
  }

  process.exit(0);
};

(async () => {
  await initialize();
  define();

  await run();
})();
