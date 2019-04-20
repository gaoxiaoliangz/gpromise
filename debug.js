let adapter = require('./test/adapter')
const assert = require('assert')

const useNativePromise = process.argv.slice(2)[0] === '-n'

if (useNativePromise) {
  adapter = require('./test/adapter2')
}

console.log(`using ${useNativePromise ? 'native' : 'my'} promise\n`)

const deferred = adapter.deferred
const resolved = adapter.resolved
const rejected = adapter.rejected

const dummy = { dummy: 'dummy' }
const sentinel = { sentinel: 'sentinel' }
const other = { other: 'other' }

const specify = (desc, fn) => {
  const done = () => {
    console.log('done called')
  }
  console.log(desc)
  fn(done)
}

const tes1 = () => {
  function testNonFunction(nonFunction, stringRepresentation) {
    specify('`onFulfilled` is ' + stringRepresentation, function(done) {
      rejected(dummy).then(nonFunction, function() {
        done()
      })
    })
  }

  testNonFunction(undefined, '`undefined`')
  // testNonFunction(null, '`null`')
  // testNonFunction(false, '`false`')
  // testNonFunction(5, '`5`')
  // testNonFunction({}, 'an object')
}

const test2 = () => {
  specify(
    'when one `onFulfilled` is added inside another `onFulfilled`',
    function(done) {
      var promise = resolved()
      var firstOnFulfilledFinished = false

      promise.then(function() {
        promise.then(function() {
          assert.strictEqual(firstOnFulfilledFinished, true)
          done()
        })
        firstOnFulfilledFinished = true
      })
    }
  )
}

const testThenOrder = () => {
  const p = resolved('val')

  p.then(v => {
    console.log(1)
  })
  p.then(v => {
    console.log(2)
  })
  p.then(v => {
    console.log(3)
  })
}

test2()
// testThenOrder()

// --------------------------------------------------------
// 1 piece
// function yFactory() { return 5; }
// var numberOfTimesThenRetrieved = 0;
// function yFactory(value) {
//   return Object.create(null, {
//     then: {
//       get: function () {
//         if (numberOfTimesThenRetrieved === 0) {
//           ++numberOfTimesThenRetrieved;
//           return function (onFulfilled) {
//             onFulfilled(value);
//           };
//         }
//         return null;
//       }
//     }
//   });
// }

// 2 piece
// var outerThenableFactory = function (value) {
//   return resolved(value);
// }

// var innerThenableFactory = function (value) {
//   return {
//       then: function (onFulfilled) {
//           onFulfilled(value);
//           throw other;
//       }
//   };
// }

// function yFactory() {
//   return outerThenableFactory(innerThenableFactory(sentinel));
// }

// function isPromise(promise) {
//   // 2.3.3.1: promise 也可能是带有 then 的 function
//   return promise && (promise instanceof Object || typeof promise === 'object') && ('then' in promise)
// }

// console.log(isPromise(yFactory(sentinel)))

// function xFactory() {
//   return {
//     then: function (resolvePromise) {
//       resolvePromise(yFactory(sentinel));
//     }
//   };
// };

// var promise = resolved(dummy).then(function onBasePromiseFulfilled() {
//   const x = xFactory();
//   return x;
// });

// promise.then(function onPromiseFulfilled(value) {
//   console.log(value)
//   console.log(numberOfTimesThenRetrieved)
// });

// 2 简化
// var promise = resolved(dummy).then(function() {
//   return {
//     then(resolvePromise) {
//       resolvePromise(resolved({
//         then(onFulfilled) {
//           onFulfilled(sentinel);
//           throw other;
//         }
//       }))
//     }
//   };
// });

// promise.then(function onPromiseFulfilled(value) {
//   console.log(value)
// });

// 3 then is not a function
// var promise = resolved(dummy).then(function() {
//   return {
//     then: 5
//   };
// });

// promise.then(function onPromiseFulfilled(value) {
//   console.log(value)
// });

// 4
// describe("2.3.2.1: If `x` is pending, `promise` must remain pending until `x` is fulfilled or rejected.",

// function xFactory() {
//   return deferred().promise;
// }

// var wasFulfilled = false;
// var wasRejected = false;

// resolved(dummy).then(function onBasePromiseFulfilled() {
//   return xFactory();
// }).then(
//   function onPromiseFulfilled() {
//     wasFulfilled = true;
//   },
//   function onPromiseRejected() {
//     wasRejected = true;
//   }
//   );

// setTimeout(function () {
//   console.log(wasFulfilled, wasRejected)
// }, 100);

// 5
// describe("calling `resolvePromise` then `rejectPromise`, both synchronously", function () {
// function xFactory() {
//   return {
//     then: function (resolvePromise, rejectPromise) {
//       resolvePromise(sentinel);
//       rejectPromise(other);
//     }
//   };
// }

// resolved(dummy).then(function onBasePromiseFulfilled() {
//   return xFactory();
// }).then(function (value) {
//   console.log(value)
// });

// 6
// describe("saving and abusing `resolvePromise` and `rejectPromise`", function () {
// var savedResolvePromise, savedRejectPromise;

// function xFactory() {
//   return {
//     then: function (resolvePromise, rejectPromise) {
//       savedResolvePromise = resolvePromise;
//       savedRejectPromise = rejectPromise;
//     }
//   };
// }

// var timesFulfilled = 0;
// var timesRejected = 0;

// rejected(dummy).then(null, function onBasePromiseRejected() {
//   return xFactory();
// }).then(
//   function () {
//     ++timesFulfilled;
//   },
//   function () {
//     ++timesRejected;
//   });

// if (savedResolvePromise && savedRejectPromise) {
//   savedResolvePromise(dummy);
//   savedResolvePromise(dummy);
//   savedRejectPromise(dummy);
//   savedRejectPromise(dummy);
// }

// setTimeout(function () {
//   savedResolvePromise(dummy);
//   savedResolvePromise(dummy);
//   savedRejectPromise(dummy);
//   savedRejectPromise(dummy);
// }, 50);

// setTimeout(function () {
//   console.log(timesFulfilled, 'should be 1')
//   console.log(timesRejected, 'should be 0')
// }, 100);
