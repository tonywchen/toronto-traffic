const _ = require('lodash');
const mongoose = require('mongoose');

const bookmark = require('debug')('bookmark');
const benchmark = require('debug')('benchmark');
const inspect = require('debug')('inspect');

const Stop = require('../../models/nextbus/Stop');
const Trip = require('../../models/nextbus/Trip');
const PathNode = require('../../models/traffic/PathNode');
const PathRoute = require('../../models/traffic/PathRoute');

const TrafficService = require('../../services/Traffic');

// should accept the following command line arguments:
// --full    - `true` to re-generate all path nodes and path routes, or `false` to just re-generate path routes
const yargs = require('yargs/yargs');
const argv = yargs(process.argv).argv;

mongoose.connect('mongodb://localhost:27017/toronto-traffic', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const populatePathNodes = async () => {
  bookmark(`(populatePathNodes)`);

  const stopDocs = await Stop.find();
  for (const stopDoc of stopDocs) {
    const stop = stopDoc.toJSON();
    const { tag, title, lon, lat, endpoint } = stop;

    await PathNode.findOneAndUpdate({
      tag
    }, {
      title,
      lon,
      lat,
      endpoint
    }, {
      new: true,
      upsert: true
    });
  }
};

const generatePathNodesChildren = async () => {
  bookmark(`(generatePathNodesChildren)`);

  const limit = 0;
  const benchmarkFrequency = (limit)? limit / 10 : 100000;

  const tripQuery = Trip.find().limit(limit);
  const tripCursor = tripQuery.cursor();

  const pathNodeMap = {};

  const { heapTotal, heapUsed } = process.memoryUsage();
  inspect(`(generatePathNodesChildren) before tripCursor loop - heapTotal: ${heapTotal}, heapUsed: ${heapUsed}`);

  let count = 1;
  let tripDoc = await tripCursor.next();
  while (tripDoc != null) {
    const routeTag = tripDoc.get('routeTag');
    const predictionMap = tripDoc.get('predictions') || {};
    const predictions = _.sortBy(Object.values(predictionMap), ({seconds}) => {
      return parseInt(seconds);
    });

    predictions.forEach((current, index) => {
      if (index >= predictions.length - 1) {
        return;
      }

      const currentTag = current.stopTag;

      const next = predictions[index + 1];
      const nextTag = next.stopTag;
      const duration = parseInt(next.seconds) - parseInt(current.seconds);

      pathNodeMap[currentTag] = pathNodeMap[currentTag] || {
        tag: currentTag,
        totalWeight: 0,
        childMap: {},
      };
      pathNodeMap[currentTag].childMap[nextTag] = pathNodeMap[currentTag].childMap[nextTag] || {
        tag: nextTag,
        weight: 0,
        score: 0,
        routeTagMap: {}
      };

      if (duration) {
        pathNodeMap[currentTag].childMap[nextTag].weight += 1;
        pathNodeMap[currentTag].childMap[nextTag].score += duration;
        pathNodeMap[currentTag].childMap[nextTag].routeTagMap[routeTag] = 1;
        pathNodeMap[currentTag].totalWeight += 1;
      }
    });

    tripDoc = await tripCursor.next();

    if (count % benchmarkFrequency === 1) {
      benchmark(`(generatePathNodesChildren) tripCursor - ${count}`);

      const { heapTotal, heapUsed } = process.memoryUsage();
      inspect(`(generatePathNodesChildren) tripCursor loop - heapTotal: ${heapTotal}, heapUsed: ${heapUsed}`);
    }
    count++;
  }

  return pathNodeMap;
};

const populatePathNodesChildren = async (pathNodeMap) => {
  bookmark(`(populatePathNodesChildren)`);

  for (const { tag, childMap, totalWeight } of Object.values(pathNodeMap)) {
    let children = Object.values(childMap).map(element => {
      const { weight, score, routeTagMap } = element;
      const routeTags = Object.keys(routeTagMap);

      let duration = 0, percent = 0;
      if (weight && score) {
        duration = score * 1.0 / weight;
        percent = weight * 100.0 / totalWeight;
      }

      if (duration) {
        return {
          tag: element.tag,
          weight,
          score,
          duration,
          percent,
          routeTags
        }
      } else {
        return null;
      }
    });

    children = _.chain(children)
      .compact()
      .sortBy('-percent')
      .value();

    await PathNode.findOneAndUpdate({
      tag
    }, {
      children
    });
  }
};

const sanitizeNode = ({tag, title, endpoint}) => {
  return {
    tag,
    title,
    endpoint
  }
};
const addToAncestors = (ancestors, node, duration) => {
  const sanitized = sanitizeNode(node);
  return [...ancestors, {
    tag: sanitized.tag,
    title: sanitized.title,
    duration
  }];
};

const startRouting = async (routeTag) => {
  bookmark(`(startRouting)`);
  const pathNodes = await PathNode.find({
    'children.routeTags': routeTag
  }).lean();

  const routes = [];
  const startingNodes = _.filter(pathNodes, {endpoint: 1});
  for (const startingNode of startingNodes) {
    const ancestors = addToAncestors([], startingNode, 0);
    for (const child of startingNode.children) {
      runRouting(routes, ancestors, pathNodes, child, 0);
    }
  }

  return routes;
};

const runRouting = (result, ancestors, pathNodes, child, level) => {
  if (child.percent < 5) {
    return;
  }

  const childNode = _.find(pathNodes, {
    tag: child.tag
  });

  if (!childNode) {
    result.push([...ancestors]);
    return;
  }

  const newAncestors = addToAncestors(ancestors, childNode, child.duration);

  // prevent endless looping
  if (childNode.endpoint || level >= 100) {
    result.push(newAncestors)
    return;
  }

  for (const grandChild of childNode.children) {
    runRouting(result, newAncestors, pathNodes, grandChild, level + 1);
  }
};

const populateRoutes = async (routeTag, routes, clear) => {
  bookmark(`(populateRoutes)`);

  if (clear) {
    await PathRoute.deleteMany({
      routeTag
    });
  }

  for (const route of routes) {
    if (route.length > 5) { // length of 3 should be sufficient, but just to be safe
      await PathRoute.create({
        routeTag,
        stops: route
      });
    }
  }
};

(async () => {
  if (argv.full) {
    await populatePathNodes();
    const pathNodeMap = await generatePathNodesChildren();
    await populatePathNodesChildren(pathNodeMap);
  }

  const routes = await startRouting('504');
  await populateRoutes('504', routes, true);

  bookmark(`(return)`);
})();

// DEBUG=bookmark,benchmark,inspect node scripts/manual/modelPathRoutes.js --full
