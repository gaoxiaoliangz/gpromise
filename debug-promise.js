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
