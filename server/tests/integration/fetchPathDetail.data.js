const stops = [{
  tag: '100',
  title: 'Stop 100'
}, {
  tag: '101',
  title: 'Stop 101'
}, {
  tag: '200',
  title: 'Stop 200'
}, {
  tag: '201',
  title: 'Stop 201'
}];

// weight: 20, score: -20
const group_11011200_100200 = [{
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  interval: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  score: -80,
  weight: 4,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 0 },
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  interval: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  score: -40,
  weight: 2,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 1 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  interval: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  score: 0,
  weight: 6,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 2 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  interval: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  score: 40,
  weight: 4,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 3 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  interval: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  score: 60,
  weight: 4,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 4 }
}];

// weight: 15, score: 60
const group_11251205_100200 = [{
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  score: -20,
  weight: 4,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 5 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  score: -10,
  weight: 5,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 6 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  score: 0,
  weight: 3,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 7 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  score: 90,
  weight: 3,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 9 }
}];

// weight: 10, score: 20
const group_11301205_100200 = [{
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  score: -40,
  weight: 2,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 5 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  score: -20,
  weight: 1,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 6 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  score: 0,
  weight: 3,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 7 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  score: 80,
  weight: 4,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 9 }
}];

// weight: 10, score: -40
const group_12011215_100200 = [{
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-12-01T12:15:00.000-05:00").valueOf(),
  interval: new Date("2020-12-01T12:15:00.000-05:00").valueOf(),
  score: -40,
  weight: 2,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 5 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-12-01T12:15:00.000-05:00").valueOf(),
  interval: new Date("2020-12-01T12:15:00.000-05:00").valueOf(),
  score: -20,
  weight: 2,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 6 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-12-01T12:15:00.000-05:00").valueOf(),
  interval: new Date("2020-12-01T12:15:00.000-05:00").valueOf(),
  score: 0,
  weight: 2,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 7 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-12-01T12:15:00.000-05:00").valueOf(),
  interval: new Date("2020-12-01T12:15:00.000-05:00").valueOf(),
  score: 20,
  weight: 4,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 9 }
}];

// weight: 3, score: -30
const group_12011220_100200 = [{
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-12-01T12:20:00.000-05:00").valueOf(),
  interval: new Date("2020-12-01T12:20:00.000-05:00").valueOf(),
  score: -40,
  weight: 2,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 5 }
}, {
  path: { from: '100', to: '200', legs: [[0, 0], [1, 1]], version: '2.0', valid: true },
  timestamp: new Date("2020-12-01T12:20:00.000-05:00").valueOf(),
  interval: new Date("2020-12-01T12:20:00.000-05:00").valueOf(),
  score: 10,
  weight: 1,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 9 }
}];

// weight: 15, score: -30
const group_11011200_101201 = [{
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  interval: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  score: -30,
  weight: 2,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 0 }
}, {
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  interval: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  score: -30,
  weight: 3,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 1 }
}, {
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  interval: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  score: 0,
  weight: 4,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 2 }
}, {
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  interval: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  score: 10,
  weight: 2,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 3 }
}, {
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  interval: new Date("2020-11-01T12:00:00.000-04:00").valueOf(),
  score: 20,
  weight: 4,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 4 }
}];

// weight: 15, score: -15
const group_11251210_101201 = [{
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  score: -40,
  weight: 4,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 5 }
}, {
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  score: -15,
  weight: 3,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 6 }
}, {
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  score: 0,
  weight: 3,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 7 }
}, {
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-25T12:05:00.000-05:00").valueOf(),
  score: 40,
  weight: 5,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 9 }
}];

// weight: 15, score: -45
const group_11301205_101201 = [{
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  score: -60,
  weight: 5,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 5 }
}, {
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  score: -15,
  weight: 3,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 6 }
}, {
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  score: 0,
  weight: 4,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 7 }
}, {
  path: { from: '101', to: '201', legs: [[1, 1], [2, 2]], version: '2.0', valid: true },
  timestamp: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  interval: new Date("2020-11-30T12:05:00.000-05:00").valueOf(),
  score: 30,
  weight: 3,
  localDateTime: { year: 2020, month: 12, day: 1, hour: 12, minute: 9 }
}];

const pathStatuses = [
  ...group_11011200_100200,
  ...group_11251205_100200,
  ...group_11301205_100200,
  ...group_12011215_100200,
  ...group_12011220_100200,

  ...group_11011200_101201,
  ...group_11251210_101201,
  ...group_11301205_101201,
];

module.exports = {
  stops,
  pathStatuses
};

