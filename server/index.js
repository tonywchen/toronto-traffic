const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

const mainRoute = require('./routes/index');
const trafficRoute = require('./routes/traffic');
const routeRoute = require('./routes/route');

const corsOptions = {
  origin: 'http://192.168.86.88:3001'
};

app.use(cors());
app.use(mainRoute);
app.use(trafficRoute);
app.use(routeRoute);

const baseUrl = 'http://0.0.0.0';
const port = 3000;

mongoose.connect('mongodb://localhost:27017/toronto-traffic', {
  // useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.listen(port, () => {
  console.log(`Server listening at ${baseUrl}:${port}`)
})
