var aplus = require('promises-aplus-tests');
var Promise = require('../promise')
var adapter = {};
var assert = require('assert');
var testFulfilled = require("./testThreeCases").testFulfilled;

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

var deferred = adapter.deferred;
var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("2.1.2.1: When fulfilled, a promise: must not transition to any other state.", function () {
  testFulfilled(dummy, function (promise, done) {
      var onFulfilledCalled = false;

      promise.then(function onFulfilled() {
          onFulfilledCalled = true;
      }, function onRejected() {
          assert.strictEqual(onFulfilledCalled, false);
          done();
      });

      setTimeout(done, 100);
  });

  specify("trying to fulfill then immediately reject", function (done) {
      var d = deferred();
      var onFulfilledCalled = false;

      d.promise.then(function onFulfilled() {
          onFulfilledCalled = true;
      }, function onRejected() {
          assert.strictEqual(onFulfilledCalled, false);
          done();
      });

      d.resolve(dummy);
      d.reject(dummy);
      setTimeout(done, 100);
  });

  specify("trying to fulfill then reject, delayed", function (done) {
      var d = deferred();
      var onFulfilledCalled = false;

      d.promise.then(function onFulfilled() {
          onFulfilledCalled = true;
      }, function onRejected() {
          assert.strictEqual(onFulfilledCalled, false);
          done();
      });

      setTimeout(function () {
          d.resolve(dummy);
          d.reject(dummy);
      }, 50);
      setTimeout(done, 100);
  });

  specify("trying to fulfill immediately then reject delayed", function (done) {
      var d = deferred();
      var onFulfilledCalled = false;

      d.promise.then(function onFulfilled() {
          onFulfilledCalled = true;
      }, function onRejected() {
          assert.strictEqual(onFulfilledCalled, false);
          done();
      });

      d.resolve(dummy);
      setTimeout(function () {
          d.reject(dummy);
      }, 50);
      setTimeout(done, 100);
  });
});
