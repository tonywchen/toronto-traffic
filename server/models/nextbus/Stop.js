const mongoose = require('mongoose');

const Stop = mongoose.model('Stop', {
  tag: String, // identifier for the stop, maps to `stop.tag` from the feed
  title: String, // title of the stop (eg. Queen Street West at Spadina Ave)
  routeTag: String, // tag identifying the route (eg. '504') the stop belongs to
  lon: Number, // longitude of the stop
  lat: Number, // latitude of the stop
});

module.exports = Stop;
