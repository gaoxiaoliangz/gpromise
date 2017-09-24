const adapter = require('./test/adapter')
// global.adapter = adapter
// var testFulfilled = require("./test/aplus-tests/helpers/testThreeCases").testFulfilled;

const deferred = adapter.deferred
const resolved = adapter.resolved
const rejected = adapter.rejected

var dummy = { dummy: "dummy" };

const promise1 = resolved(dummy)

var promise2 = promise1.then(function onFulfilled() {
  // throw { then: function () { } }
  throw resolved(dummy)
});

promise2.then(null, function onPromise2Rejected(actualReason) {
  console.log(actualReason);
});
