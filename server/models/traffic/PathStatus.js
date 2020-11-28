const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Path = require('./Path').schema;

/**
 * PathStatus
 *
 * Description.
 * PathStatus describes how busy the traffic at a specific time along a Path, or between two points.
 * The busy-ness of the traffic is indicated by `score`. A `score` value of 0 indicates the traffic
 * is normal, whereas a more postive value indicates the traffic is busier, and a more negative value
 * indicates the traffic is less busy. `segments` provides more granular data along the path, where
 * each entry in `segments` provides finer `score` value within a normalized path range (`from`, `to`).
 */

const PathStatus = mongoose.model('PathStatus', {
  path: {
    type: Path
  },
  timestamp: Number,
  interval: Number,
  localDateTime: mongoose.Schema.Types.Mixed,
  score: Number,
  weight: Number,
  segments: [{ // An array representing the busy-ness of the traffic along the path. Earlier version would contain only 1 status in the array, but will add more statuses to add more granularity.
    from: Number,
    to: Number,
    score: Number, // A score indicating how busy the route is compared to normal. The larger the score the busier it is. The score can be also be negative, indicating that it is less busy than usual.
    weight: Number // A value indicating signifance of the score. Potential factor include more observations
  }]
});

module.exports = PathStatus;
