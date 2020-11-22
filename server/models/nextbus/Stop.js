const mongoose = require('mongoose');

const Stop = mongoose.model('Stop', {
  tag: String, // identifier for the stop, maps to `stop.tag` from the feed
  title: String, // title of the stop (eg. Queen Street West at Spadina Ave)
  longitude: Number, // longitude of the stop
  latitude: Number, // latitude of the stop
});

module.exports = Stop;
