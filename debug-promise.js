const adapter = require('./test/adapter')
// global.adapter = adapter
// var testFulfilled = require("./test/aplus-tests/helpers/testThreeCases").testFulfilled;

const deferred = adapter.deferred
const resolved = adapter.rejected
const rejected = adapter.rejected

var dummy = { dummy: "dummy" };


// testFulfilled(dummy, function (promise1, done) {
//   var promise2 = promise1.then(function onFulfilled() {
//       throw expectedReason;
//   });

//   promise2.then(null, function onPromise2Rejected(actualReason) {
//       assert.strictEqual(actualReason, expectedReason);
//       done();
//   });
// });


// const d1 = deferred()
const d1 = resolved('what?')

const a = d1
  .then(() => {
    // throw { then: function () { } }
    throw resolved(dummy)
    // throw rejected(dummy);
  })
  .catch(v => {
    console.log(v)
  })

// d1.resolve('a')
