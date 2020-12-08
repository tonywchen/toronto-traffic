

const mongoose = require('mongoose');

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
  from: String, // stop tag of the from stop
  to: String, // stop tag of the to stop
  legs: Array, // Array of coordinates [longitudes, latitudes],
  polyline: String
});

module.exports = Path;
