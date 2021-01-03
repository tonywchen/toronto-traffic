const { ObjectID } = require('mongodb');

module.exports = {
  paths: [{
    _id: new ObjectID(),
    from: 'valid-100',
    to: 'valid-200',
    legs: [[0, 0], [1, 1]],
    version: '2.0',
    valid: true
  }, {
    _id: new ObjectID(),
    from: 'valid-101',
    to: 'valid-201',
    legs: [[1, 1], [2, 2]],
    version: '2.0',
    valid: true
  }, {
    _id: new ObjectID(),
    from: 'valid-102',
    to: 'valid-202',
    legs: [[2, 2], [3, 3]],
    version: '2.0',
    valid: true
  }, {
    _id: new ObjectID(),
    from: 'invalid-103',
    to: 'invalid-203',
    legs: [[3, 3], [4, 4]],
    version: '1.0',
    valid: true
  }]
};
