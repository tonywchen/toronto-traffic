const readlineSync = require('readline-sync');
const mongoose = require('mongoose');

const Path = require('../../models/traffic/Path');
const PathStatus = require('../../models/traffic/PathStatus');

mongoose.connect('mongodb://localhost:27017/toronto-traffic', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const getFrom = () => {
  const from = readlineSync.question('Please enter the starting stop tag for the path: ');
  console.log(`You have entered ${from}`);

  return from;
};
const getTo = () => {
  const to = readlineSync.question('Please enter the starting stop tag for the path: ');
  console.log(`You have entered ${to}`);

  return to;
};
const getLegs = () => {
  const legsString = readlineSync.question('Please enter new legs: ');
  console.log(`You have entered ${legsString}`);

  const legs = validateLegsString(legsString);

  return legs;
};
const validateLegsString = (legsString) => {
  try {
    const legs = JSON.parse(legsString);

    const isArray = Array.isArray(legs);
    if (!isArray) {
      return null;
    }

    for (const leg of legs) {
      const isLegAnArray = Array.isArray(leg);
      if (!isLegAnArray) {
        return null;
      }

      const isLegValid = leg.length === 2;
      if (!isLegValid) {
        return null;
      }
    }
    console.log(`The legs entered are valid`);

    return legs;
  } catch (e) {
    console.log(`The legs entered are not valid. Exiting...`)
    console.error(e.stack());
    return null;
  }
};
const findPath = async (from, to) => {
  const path = await Path.findOne({from, to});
  if (!path) {
    console.log(`No path between ${from}-${to} can be found. Exiting...`)
    return null;
  }

  console.log(`Path ${from}-${to} has been found: `);
  console.log(path.legs);
  return path;
};

(async () => {
  const from = getFrom();
  const to = getTo();

  console.log(`Looking up Path ${from}-${to}`);

  const path = await findPath(from, to);
  if (!path) {
    process.exit(1);
  }

  const legs = getLegs();
  if (!legs) {
    process.exit(1);
  }

  await Path.updateOne({from, to}, {legs});
  const res = await PathStatus.updateMany({
    'path.from': from,
    'path.to': to,
    'path.version': path.version
  }, {
    'path.legs': legs
  });
  console.log(`Path ${from}-${to} has been updated`);
  console.log(`${res.nModified} of ${res.n} Path Statues have been updated`);

  process.exit(1);
})();
