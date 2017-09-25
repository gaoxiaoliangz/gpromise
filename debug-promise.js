const adapter = require('./test/adapter')

const deferred = adapter.deferred
const resolved = adapter.resolved
const rejected = adapter.rejected

var dummy = { dummy: "dummy" };
var sentinel = { sentinel: "sentinel" };
var other = { other: "other" };

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
var savedResolvePromise, savedRejectPromise;

function xFactory() {
  return {
    then: function (resolvePromise, rejectPromise) {
      savedResolvePromise = resolvePromise;
      savedRejectPromise = rejectPromise;
    }
  };
}

var timesFulfilled = 0;
var timesRejected = 0;

rejected(dummy).then(null, function onBasePromiseRejected() {
  return xFactory();
}).then(
  function () {
    ++timesFulfilled;
  },
  function () {
    ++timesRejected;
  });

if (savedResolvePromise && savedRejectPromise) {
  savedResolvePromise(dummy);
  savedResolvePromise(dummy);
  savedRejectPromise(dummy);
  savedRejectPromise(dummy);
}

setTimeout(function () {
  savedResolvePromise(dummy);
  savedResolvePromise(dummy);
  savedRejectPromise(dummy);
  savedRejectPromise(dummy);
}, 50);

setTimeout(function () {
  console.log(timesFulfilled, 'should be 1')
  console.log(timesRejected, 'should be 0')
}, 100);
