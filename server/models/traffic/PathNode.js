const mongoose = require('mongoose');

const PathNode = mongoose.model('PathNode', {
  tag: { type: String, index: true }, // map to transit stop tag
  title: String,
  lon: Number,
  lat: Number,
  endpoint: Number,
  children: [{
    tag: String,
    routeTags: Array,
    score: Number, // total duration
    weight: Number, // number of durations
    duration: Number, // average duration
    percent: Number
  }]
});

module.exports = PathNode;
