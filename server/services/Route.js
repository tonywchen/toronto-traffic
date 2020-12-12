const Subroute = require('../models/nextbus/Subroute')
const Path = require('../models/traffic/Path');

const areLegsSame = (leg1, leg2) => {
  if (!leg1 || !leg2) {
    return false;
  }

  return (leg1[0] === leg2[0] && leg1[1] === leg2[1]);
};

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
      let lastLeg = null;
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
        let hasDuplicatedLegs = areLegsSame(lastLeg, legs[0]);
        if (hasDuplicatedLegs) {
          legs.shift();
        }
        lastLeg = legs[0];

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
