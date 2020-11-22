const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Route = mongoose.model('Route', {
  tag: String, // tag of the route (eg. 501, 504), maps to `route.tag` from the feed
  title: String, // title describing of the route (eg. 501 Queen, 504 King), maps to `route.title` from the feed
  agency: String, // the transit agency the route belongs to (eg. TTC)
  subroutes: [{ // a route may contain many variations (eg. 501 Queen - East towards Long Branch, 504 King - West toward Broadview Stations, 504 King - West towards Cherry Street)
    type: Schema.Types.ObjectId,
    ref: 'Subroute'
  }],
});

module.exports = Route;
