module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '3.6.12',
      skipMD5: true
    },
    autoStart: false,
    instance: {
      dbName: 'toronto-traffic-test'
    }
  }
};
