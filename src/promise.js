const { doAsync, unwrap } = require('./util')
const { PENDING, RESOLVED, REJECTED, INTERNAL } = require('./constants')

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

function settlePromise(promise, state, value) {
  promise.state = state
  promise.value = value
}

function resolve(value) {
  if (this.state === PENDING) {
    unwrap(value, (state, value) => {
      settlePromise(this, state, value)
      resolveChained(this)
    })
  }
}

function reject(value) {
  if (this.state === PENDING) {
    settlePromise(this, REJECTED, value)
    resolveChained(this)
  }
}

function registerChained(onFulfilled, onRejected) {
  let promise

  if (this.state === PENDING) {
    promise = new GPromise(INTERNAL)
  }

  const retrieveValue = (initValue, handler) => {
    let value = initValue
    let errored = false
    try {
      if (typeof handler === 'function') {
        value = handler(value)
        // 2.3.1
        if (value === promise) {
          throw new TypeError('Cannot resolve promise with itself!')
        }
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
        const { value, errored } = retrieveValue(this.value, onFulfilled)
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
            const { value, errored } = retrieveValue(this.value, onRejected)
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

function resolveChained(promise) {
  const state = promise.state
  const value = promise.value

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

    if (!errored) {
      unwrap(settleValue, (state2, value2) => {
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

module.exports = GPromise
