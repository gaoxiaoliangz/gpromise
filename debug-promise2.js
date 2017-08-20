const adapter = require('./test/adapter')

const deferred = adapter.deferred()
deferred.resolve(true)
deferred.reject(true)

setTimeout(function() {
  const a = deferred.promise
}, 1)
