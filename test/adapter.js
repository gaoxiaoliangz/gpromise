const GPromise = require('../promise')

module.exports = {
  deferred: () => {
    const pending = {}
    pending.promise = new GPromise((resolve, reject) => {
      pending.resolve = resolve
      pending.reject = reject
    })

    return pending
  },
  resolved: value => GPromise.resolve(value),
  rejected: reason => GPromise.resolve(reason),
}
