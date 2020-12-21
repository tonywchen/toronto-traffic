const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

const mainRoute = require('./routes/index');
const trafficRoute = require('./routes/traffic');
const routeRoute = require('./routes/route');

const config = require('./config.json')
const host = config.server.host;
const port = config.server.port;
const domain = config.domain;

const corsOptions = {
  origin: domain
};
app.use(cors(corsOptions));app.use(mainRoute);

app.use(trafficRoute);
app.use(routeRoute);

mongoose.connect('mongodb://localhost:27017/toronto-traffic', {
  // useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.listen(port, () => {
  console.log(`TTCongestion listening at ${host}:${port}`)
})
