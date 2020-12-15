const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const SimplePredictionSchema = require('./SimplePrediction').schema;
/**
 * Trip
 *
 * A trip is when a vehicle makes its way from one terminal station to
 * another along a designated route and in a designated direction. In order
 * to compute traffic based on prediction data, it is important to compare and
 * track prediction changes over time along the same trip.
 *
 * `Trip` class attempts to group prediction data by trips, where predictions
 * from the same trip is identified by `tripTag` from the Nextbus feed. Because
 * a trip is defined by the "route", "direction", and "branch", these data will
 * also be part of the trip attribute. This also helps removing redundant route,
 * direction, and branch information from each predictions and reduce the size
 * of the documents.
 */

const Trip = mongoose.model('Trip', {
  timestamp: Number, // time at which the trip data is captured
  tripTag: String,
  routeTag: String,
  routeTitle: String,
  dirTag: String,
  branch: String,
  /* predictions: {
    type: Map,
    of: SimplePredictionSchema
  } */
  predictions: Schema.Types.Mixed,
  nextStopTags: Array,
  previousStopTag: String
});

module.exports = Trip;
