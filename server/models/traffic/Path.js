

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VERSION = '2.0';
/**
 * Path
 *
 * Description.
 * Path class describes the driving path required to get from a stop (ie. `from`)
 * to the next (ie. `to`). Because a driving path is usually a polyline instead
 * of one straight line between the `from` and `to` points, we need to get this
 * info Mapbox Direction API and store the results as `legs` for later uses.
 */

const pathSchema = new Schema({
  from: String, // stop tag of the from stop
  to: String, // stop tag of the to stop
  legs: Array, // Array of coordinates [longitudes, latitudes],
  polyline: String,
  lastUpdated: Number,
  version: String,
  valid: {
    type: Boolean,
    default: true
  }
});

const preSaveOrUpdateFn = function (next) {
  this.set({
    version: VERSION,
    lastUpdated: new Date().valueOf()
  });
  next();
};

pathSchema.pre('save', preSaveOrUpdateFn);
pathSchema.pre('update', preSaveOrUpdateFn);
pathSchema.pre('updateOne', preSaveOrUpdateFn);
pathSchema.pre('findOneAndUpdate', preSaveOrUpdateFn);

const Path = mongoose.model('Path', pathSchema);
Path.VERSION = VERSION;

module.exports = Path;
