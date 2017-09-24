const adapter = require('./test/adapter')

const deferred = adapter.deferred()
// const a = deferred.promise
//   .then(data => {
//     throw new Error('fucked')
//   })
//   .catch(err => {
//     console.log(err)
//   })

const a = deferred.promise
  .then(() => {
    throw null
  })
  .catch(v => {
    console.log(v)
  })
// .catch(err => {
//   console.log(err)
// })

// deferred.resolve('a')
deferred.resolve('a')

// const a = Promise.resolve(2)

// a.then(b => {
//   console.log(b)
// })
