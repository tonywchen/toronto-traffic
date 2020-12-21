const mongoose = require('mongoose');

const PathRoute = mongoose.model('PathRoute', {
  routeTag: String,
  stops: [{
    tag: String,
    title: String,
    duration: Number
  }]
});

module.exports = PathRoute;
