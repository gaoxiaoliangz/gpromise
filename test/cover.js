var aplus = require('promises-aplus-tests');
var assert = require('assert');
var adapter = require('./adapter');

describe('GPromise', function () {
  describe('Promises/A+ Tests', function () {
    aplus.mocha(adapter);
  });
});
