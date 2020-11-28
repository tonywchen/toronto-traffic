const express = require('express');
const mainRoute = require('./routes/index');
const trafficRoute = require('./routes/traffic');

const app = express();
app.use(mainRoute);
app.use(trafficRoute);

const baseUrl = 'http://0.0.0.0';
const port = 3000;

app.listen(port, () => {
  console.log(`Server listening at ${baseUrl}:${port}`)
})
