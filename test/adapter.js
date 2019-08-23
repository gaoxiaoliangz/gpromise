let useWhich = 'myPromise'
const useStd = process.argv.includes('--std')

if (useStd) {
  useWhich = 'standardPromise'
}

const createAdapter = Promise => ({
  deferred: () => {
    const pending = {}
    pending.promise = new Promise((resolve, reject) => {
      pending.resolve = resolve
      pending.reject = reject
    })

    return pending
  },
  resolved: value => Promise.resolve(value),
  rejected: reason => Promise.reject(reason),
})

const promiseMap = {
  standardPromise: createAdapter(Promise),
  myPromise: createAdapter(require('../src/promise')),
  myPromiseV1: createAdapter(require('../src/promise-v1/promise')),
}

module.exports = promiseMap[useWhich]
