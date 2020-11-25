const mongoose = require('mongoose');

const SimplePrediction = mongoose.model('SimplePrediction', {
  seconds: Number,
  stopTag: String,
  isDeparture: Boolean
});

module.exports = SimplePrediction;

