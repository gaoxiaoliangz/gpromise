const adapter = require('./test/adapter')


// 1
// const deferred = adapter.deferred()
// deferred.resolve(true)
// deferred.reject(true)

// setTimeout(function() {
//   const a = deferred.promise
// }, 1)

// // const rejected = Promise.reject('no')
// const rejected = adapter.rejected('no')

// rejected.then(a => {
// }, a => {
// })


// 2
// const deferred = adapter.deferred()
// deferred.promise
//   .then(1)
//   .then(data => {
//     console.log(data)
//   })

// deferred.resolve('ok')


// 3
// const deferred = adapter.resolved(1).then(2).then(data => {
//   console.log(data)
// })

// 4
// const deferred = adapter.resolved(1).then(data => {
//   console.log(data)
// })

// 5
// var d = adapter.deferred();
// var isFulfilled = false;

// d.promise.then(function onFulfilled() {

// });

// setTimeout(function () {
//     d.resolve(1);
//     isFulfilled = true;
// }, 50);

// `then` may be called multiple times on the same promise.
var sentinel = { sentinel: "sentinel" };
const deferred = adapter.deferred()
const promise = deferred.promise
// const promise = adapter.resolved(sentinel)

let count = 0

promise.then(data => {
  count++
})

promise.then(data => {
  return new Promise(resolve => {
    setTimeout(function () {
      resolve(1)
    }, 100000)
  })
})
  .then(data => {
    return 2
  })

// promise
//   .then(err => {
//     return err
//   })
//   .then(data => {
//     count++
//   })
//   .then(data => {
//     return 1
//   })
//   .then(data => {

//   })

// promise.then(data => {
//   const a = count
// })
//   .then(data => {
//     return 1
//   })
//   .then(data => {

//   })

deferred.resolve(sentinel)
