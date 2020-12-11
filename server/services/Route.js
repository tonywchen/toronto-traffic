const Subroute = require('../models/nextbus/Subroute')
const Path = require('../models/traffic/Path');

class RouteService {
  constructor() { }

  async getSubroutes() {
    const paths = await Path.find().lean();
    const pathMap = {};
    paths.forEach(({ from, to, legs }) => {
      if (legs) {
        const identifier = `${from}-${to}`;
        pathMap[identifier] = {
          from,
          to,
          legs
        };
      }
    });

    // for now, get all subroutes until routes are defined
    const subroutes = await Subroute.find().lean();
    const results = subroutes.map((subroute) => {
      const allLegs = [];
      subroute.stops.forEach((stop, stopIndex) => {
        if (stopIndex >= subroute.stops.length - 1) {
          return;
        }

        const nextStopIndex = stopIndex + 1;
        const stopTag = stop.tag;
        const nextStopTag = subroute.stops[nextStopIndex].tag;

        const identifier = `${stopTag}-${nextStopTag}`;
        const routePath = pathMap[identifier];
        if (!routePath) {
          return;
        }

        let legs = routePath.legs || [];
        if (stopIndex > 0) {
          legs.shift()
        }

        allLegs.push(...legs);
      });

      return {
        title: subroute.title,
        legs: allLegs
      };
    });

    return {
      subroutes: results
    };
  }
}

module.exports = RouteService;
