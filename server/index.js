const mongoose = require('mongoose');

const app = require('./app');

const config = require('./config.json')
const { host, port } = config.server;

const DATABASE_NAME = 'toronto-traffic';
mongoose.connect(`mongodb://localhost:27017/${DATABASE_NAME}`, {
  useNewUrlParser: true,
});
mongoose.connection.on('connected', () => {
  console.log(`Connected to '${DATABASE_NAME}' database`)
});

app.listen(port, () => {
  console.log(`TTCongestion listening at ${host}:${port}`)
});
