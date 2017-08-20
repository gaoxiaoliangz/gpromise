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
const deferred = adapter.resolved(1).then(2).then(data => {
  console.log(data)
})
