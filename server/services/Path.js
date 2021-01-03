const _ = require('lodash');

const Path = require('../models/traffic/Path');

const PathService = {
  getPaths: async () => {
    const pathDocs = await Path.find({
      version: Path.VERSION,
      valid: true
    });

    const paths = pathDocs.map((pathDoc) => {
      return {
        from: pathDoc.from,
        to: pathDoc.to,
        legs: pathDoc.legs
      };
    });

    return {
      paths
    };
  },
};

module.exports = PathService;
