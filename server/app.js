const express = require('express');
const app = express();
const cors = require('cors');

const config = require('./config.json')
const domain = config.domain;
const corsOptions = {
  origin: domain
};
app.use(cors(corsOptions));

const mainRoute = require('./routes/index');
const trafficRoute = require('./routes/traffic');
const routeRoute = require('./routes/route');

app.use(mainRoute);
app.use(trafficRoute);
app.use(routeRoute);

module.exports = app;
