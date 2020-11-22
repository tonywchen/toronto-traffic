const mongoose = require('mongoose');

const Prediction = mongoose.model('Prediction', {
  timestamp: Number, // time at which the prediciton is made, different from `prediction.epochTime`
  routeTag: String,
  subrouteTag: String,
  stopTag: String,
  seconds: Number, // estimated seconds till arrival at the stop
  isDeparture: Boolean,
  vehicle: String,
  block: String, // not sure what this is, but is part of the `prediction` tag from the feed
  tripTag: String
});

module.exports = Prediction;
