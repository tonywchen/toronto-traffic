const mongoose = require('mongoose');

const Vehicle = mongoose.model('Vehicle', {
  id: String,
  routeTag: String,
  dirTag: String,
  lon: Number,
  lat: Number,
  heading: Number,
  speedKmHr: Number,
  secsSinceReport: Number,
  timestamp: Number
});

module.exports = Vehicle;
