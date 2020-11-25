const mongoose = require('mongoose');
const Agenda = require('Agenda');

const Nextbus = require('../services/Nextbus');
const Trip = require('../models/nextbus/Trip');

const nextbusService = Nextbus();

let agenda;
const initialize = () => {
  mongoose.connect('mongodb://localhost:27017/toronto-traffic');
  agenda = new Agenda({db:
    {
      address: 'mongodb://localhost:27017/agenda'
    }
  });

  agenda.define('Fetch Trips', fetchTrip);
};

const stops = [];
const fetchStops = async () => {
  const stopResults = await nextbusService.fetchRoute('504');
  stops.push(...stopResults.stops);
};

const fetchTrip = async () => {
  const { groups } = await nextbusService.fetchPredictions('504', '', stops);

  let tripSize = 0;
  for (const groupKey of Object.keys(groups)) {
    const trip = groups[groupKey];

    const tripObj = new Trip(trip);
    await tripObj.save();

    tripSize++;
  };
  console.log(`[${new Date()}] - ${tripSize} trips`);
}

(async () => {
  initialize();
  await fetchStops();

  await agenda.start();
  await agenda.every('1 minute', 'Fetch Trips');
})();
