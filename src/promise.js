const PENDING = 0
const RESOLVED = 1
const REJECTED = 2
const INTERNAL = () => { }

/**
 * 等待所有 Promise 依赖的所有 Promise 变为 resolved 或者其中一个 rejected
 * （如果一个 Promise resolve 的值是一个状态为 pending 的 Promise 那么，这个
 * Promise 仍然是 pending 的状态）
 * @param {GPromise} promise 
 * @param {function} done
 */
function untilFullfill(promise, done) {
  // todo: work with other implementations of Promise
  if (promise instanceof GPromise) {
    if (promise.state === PENDING) {
      promise
        .then(data => {
          if (data instanceof GPromise) {
            untilFullfill(data, done)
          } else {
            done(promise)
          }
        }, err => {
          // todo: 为什么这边需要重新设置？
          promise.value = err
          promise.state = REJECTED
          done(promise)
        })
    } else {
      done(promise)
    }
  } else {
    throw new Error('Not a promise!')
  }
}

function doAsync(fn) {
  setTimeout(function () {
    fn.call(null)
  }, 0)
}

// function findClosest(promise, key) {
//   const next = promise.next
//   if (!next) {
//     return
//   }
//   if (next[key]) {
//     return next
//   } else {
//     return findClosest(next, key)
//   }
// }

function resolveChained(promise) {
  const state = promise.state

  if (!promise.queue.length === 0) {
    if (promise.state === REJECTED) {
      return console.error('UnhandledPromiseRejectionWarning:', promise.value)
    }
    return
  }

  if (state !== RESOLVED && state !== REJECTED) {
    return console.error(`Unexpected error! state should not be ${state}`)
  }

  const fnName = state === RESOLVED ? 'thenHandler' : 'rejectHandler'
  const processResult = (result2, next) => {
    if (result2 instanceof GPromise) {
      untilFullfill(result2, fullfilledPromise => {
        next.value = fullfilledPromise.value
        next.state = fullfilledPromise.state
        resolveChained(next)
      })
    } else {
      next.value = result2
      next.state = RESOLVED
      resolveChained(next)
    }
  }

  promise.queue.forEach((next) => {
    doAsync(() => {
      let result = promise.value
      if (typeof next[fnName] === 'function') {
        result = next[fnName](promise.value)
      }

      processResult(result, next)
    })
  })
}

// proto fns using bind
function registerChained(thenHandler, rejectHandler) {
  let promise

  if (this.state === PENDING) {
    promise = new GPromise(INTERNAL)
  }

  if (this.state === RESOLVED) {
    // this will start the new chain reaction
    promise = new GPromise(resolve => {
      doAsync(() => {
        let val = this.value
        if (typeof thenHandler === 'function') {
          val = thenHandler(this.value)
        }
        resolve(val)
      })
    })
  }

  if (this.state === REJECTED) {
    if (rejectHandler) {
      promise = new GPromise((resolve, reject) => {
        doAsync(() => {
          let val = this.value
          if (typeof rejectHandler === 'function') {
            val = rejectHandler(this.value)
            resolve(val)
          } else {
            reject(val)
          }
        })
      })
    } else {
      promise = GPromise.reject(this.value)
    }
  }
  promise.thenHandler = thenHandler
  promise.rejectHandler = rejectHandler
  this.queue.push(promise)
  return promise
}

function handleExecutorCallback(value, defaultState) {
  if (value instanceof GPromise) {
    untilFullfill(value, fullfilledPromise => {
      this.value = fullfilledPromise.value
      this.state = fullfilledPromise.state

      if (this.executor !== INTERNAL) {
        resolveChained(this)
      }
    })
  } else {
    this.value = value
    this.state = defaultState

    if (this.executor !== INTERNAL) {
      resolveChained(this)
    }
  }
}

function resolve(value) {
  if (this.state === PENDING) {
    handleExecutorCallback.call(this, value, RESOLVED)
  }
}

function reject(value) {
  if (this.state === PENDING) {
    handleExecutorCallback.call(this, value, REJECTED)
  }
}

class GPromise {
  static resolve(value) {
    return new GPromise((resolve) => {
      resolve(value)
    })
  }

  static reject(reason) {
    return new GPromise((resolve, reject) => {
      reject(reason)
    })
  }

  constructor(executor) {
    this.queue = []
    this.value = undefined
    this.thenHandler = undefined
    this.rejectHandler = undefined
    this.state = PENDING
    this.executor = executor

    executor(resolve.bind(this), reject.bind(this))
  }

  catch(rejectHandler) {
    return registerChained.call(this, undefined, rejectHandler)
  }

  then(thenHandler, rejectHandler) {
    return registerChained.call(this, thenHandler, rejectHandler)
  }
}

module.exports = GPromise
