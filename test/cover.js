var aplus = require('promises-aplus-tests');
// var Promise = require('../lie')
var Promise = require('../promise')
// var Promise = require('bluebird')
var adapter = {};
var assert = require('assert');

adapter.deferred = function () {
  var pending = {};
  pending.promise = new Promise(function (resolver, reject) {
    pending.resolve = resolver;
    pending.reject = reject;
  });
  return pending;
};
adapter.resolved = function (value) {
  return Promise.resolve(value);
}
adapter.rejected = function (reason) {
  return Promise.reject(reason);
}

describe('Lie', function () {
  describe('Promises/A+ Tests', function () {
    aplus.mocha(adapter);
  });
});
