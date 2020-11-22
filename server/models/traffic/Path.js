

const mongoose = require('mongoose');
const Stop = require('./Stop');

/**
 * Path
 *
 * Description.
 * Path class describes the driving path required to get from a stop (ie. `from`)
 * to the next (ie. `to`). Because a driving path is usually a polyline instead
 * of one straight line between the `from` and `to` points, we need to get this
 * info Mapbox Direction API and store the results as `legs` for later uses.
 */

const Path = mongoose.model('Path', {
  from: {
    type: Stop
  },
  to: {
    type: Stop
  },
  legs: [{ // all the coordinates that make up the path
    longitude: {
      type: Number
    },
    latitude: {
      type: Number
    }
  }]
});

module.exports = Path;
