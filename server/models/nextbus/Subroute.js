const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Subroute = mongoose.model('Subroute', {
  title: String, // name of the subroute, maps to `direction.title` from the feed
  tag: String, // identifies the route, maps to `direction.tag` from the feed
  branch: String, // the branch the subroute belongs to (eg. 504A, 501B), maps to `direction.branch` from the feed,
  stops: Array // list of stops along the subroute
});

module.exports = Subroute;
