const PENDING = 0
const RESOLVED = 1
const REJECTED = 2
const INTERNAL = () => { }

function isPromise(promise) {
  return (promise && typeof promise === 'object') && (typeof promise.then === 'function')
}

/**
 * 等待所有 Promise 依赖的所有 Promise 变为 resolved 或者其中一个 rejected
 * （如果一个 Promise resolve 的值是一个状态为 pending 的 Promise 那么，这个
 * Promise 仍然是 pending 的状态）
 * @param {GPromise} promise 
 * @param {function} done
 */
function untilFullfill(promise, done) {
  if (isPromise(promise)) {
    promise
      .then(data => {
        if (isPromise(data)) {
          untilFullfill(data, done)
        } else {
          done(RESOLVED, data)
        }
      }, err => {
        done(REJECTED, err)
      })
  } else {
    throw new Error('Not a promise!')
  }
}

function doAsync(fn) {
  setTimeout(function () {
    fn.call(null)
  }, 0)
}

function resolveChained(promise) {
  const state = promise.state
  const value = promise.value

  // if (!promise.queue.length === 0) {
  //   if (promise.state === REJECTED) {
  //     return console.error('UnhandledPromiseRejectionWarning:', promise.value)
  //   }
  //   return
  // }

  if (state !== RESOLVED && state !== REJECTED) {
    return console.error(`Unexpected error! state should not be ${state}`)
  }

  const settle = (item, handler, done) => {
    let settleValue = value
    let settleState = state
    let errored = false
    try {
      if (typeof handler === 'function') {
        settleValue = handler(value)
        settleState = RESOLVED
      }
    } catch (error) {
      errored = true
      settleValue = error
      settleState = REJECTED
    }

    if (isPromise(settleValue) && !errored) {
      untilFullfill(settleValue, (state2, value2) => {
        const finalState = settleState === REJECTED ? REJECTED : state2
        settlePromise(item, finalState, value2)
        done()
      })
    } else {
      settlePromise(item, settleState, settleValue)
      done()
    }
  }

  promise.queue.forEach((item) => {
    doAsync(() => {
      if (state === RESOLVED) {
        settle(item, item.onFulfilled, () => {
          resolveChained(item)
        })
      } else {
        settle(item, item.onRejected, () => {
          resolveChained(item)
        })
      }
    })
  })
}

function settlePromise(promise, state, value) {
  promise.state = state
  promise.value = value
}

// proto fns using bind
function registerChained(onFulfilled, onRejected) {
  let promise

  if (this.state === PENDING) {
    promise = new GPromise(INTERNAL)
  }

  const getValue = (initValue, handler) => {
    let value = initValue
    let errored = false
    try {
      if (typeof handler === 'function') {
        value = handler(value)
      }
    } catch (error) {
      errored = true
      value = error
    }
    return { value, errored }
  }

  if (this.state === RESOLVED) {
    // this will start the new chain reaction
    promise = new GPromise((resolve, reject) => {
      doAsync(() => {
        const { value, errored } = getValue(this.value, onFulfilled)
        if (errored) {
          reject(value)
        } else {
          resolve(value)
        }
      })
    })
  }

  if (this.state === REJECTED) {
    if (onRejected) {
      promise = new GPromise((resolve, reject) => {
        doAsync(() => {
          if (typeof onRejected === 'function') {
            const { value, errored } = getValue(this.value, onRejected)
            if (errored) {
              reject(value)
            } else {
              resolve(value)
            }
          } else {
            reject(this.value)
          }
        })
      })
    } else {
      promise = GPromise.reject(this.value)
    }
  }
  promise.onFulfilled = onFulfilled
  promise.onRejected = onRejected
  this.queue.push(promise)
  return promise
}

function resolve(value) {
  if (this.state === PENDING) {
    if (isPromise(value)) {
      untilFullfill(value, (state, value) => {
        settlePromise(this, state, value)
        resolveChained(this)
      })
    } else {
      settlePromise(this, RESOLVED, value)
      resolveChained(this)
    }
  }
}

function reject(value) {
  if (this.state === PENDING) {
    settlePromise(this, REJECTED, value)
    resolveChained(this)
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
    this.onFulfilled = undefined
    this.onRejected = undefined
    this.state = PENDING
    this.executor = executor
    executor(resolve.bind(this), reject.bind(this))
  }

  catch(onRejected) {
    return registerChained.call(this, undefined, onRejected)
  }

  then(onFulfilled, onRejected) {
    return registerChained.call(this, onFulfilled, onRejected)
  }
}

module.exports = GPromise
