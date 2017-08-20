const GPromise = require('./promise')

var adapter = {};

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

const deferred = adapter.deferred()
deferred.resolve(true)
deferred.reject(true)

setTimeout(function() {
  const a = deferred.promise
}, 1)
