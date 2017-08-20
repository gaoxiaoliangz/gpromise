const adapter = require('./test/adapter')

const deferred = adapter.deferred()
deferred.resolve(true)
deferred.reject(true)

setTimeout(function() {
  const a = deferred.promise
}, 1)


// const rejected = Promise.reject('no')
const rejected = adapter.rejected('no')

rejected.then(a => {

}, a => {

})
