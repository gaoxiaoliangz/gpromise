const Promise = require('../src/promise')

module.exports = {
  deferred: () => {
    const pending = {}
    pending.promise = new Promise((resolve, reject) => {
      pending.resolve = resolve
      pending.reject = reject
    })

    return pending
  },
  resolved: value => Promise.resolve(value),
  rejected: reason => Promise.resolve(reason),
}
