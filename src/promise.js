// @ts-check
const STATE_PENDING = 'pending'
const STATE_RESOLVED = 'resolved'
const STATE_REJECTED = 'rejected'

let debugId = 0
const getDebugId = () => debugId++

const getThen = maybeThenable => {
  // TODO: handle retrive error
  const then = maybeThenable !== null && typeof maybeThenable === 'object' && maybeThenable.then

  if (typeof then === 'function') {
    return then
  }
  return null
}

const makeAsync = setImmediate

const unwrap = (maybeThenable, resolve, reject) => {
  let called = false
  const then = getThen(maybeThenable)
  if (then) {
    return then.call(
      maybeThenable,
      value => {
        if (called) {
          return
        }
        called = true
        // check nested thenables
        try {
          unwrap(value, resolve, reject)
        } catch (error) {
          reject(error)
        }
      },
      err => {
        // TODO: is is necessary
        if (called) {
          return
        }
        called = true
        reject(err)
      },
    )
  }
  resolve(maybeThenable)
}

class Promise {
  static resolve(value) {
    return new Promise(resolve => {
      resolve(value)
    })
  }

  static reject(value) {
    return new Promise((resolve, reject) => {
      reject(value)
    })
  }

  constructor(executor) {
    // { reslove, reject, onFullfilled, onRejected, promise }
    this.chained = []
    this._state = STATE_PENDING
    this._value = null
    this._resolveOrRejectCalled = false
    this._changeStateCalled = false
    this._debugId = getDebugId()
    executor(this._resolve.bind(this), this._reject.bind(this))
  }

  _changeState(state, value) {
    if (this._state === STATE_PENDING) {
      this._changeStateCalled = true
      this._state = state
      this._value = value
      makeAsync(this._execCallbacks.bind(this))
    }
  }

  _resolve(value) {
    if (this._resolveOrRejectCalled) {
      return
    }
    this._resolveOrRejectCalled = true
    try {
      unwrap(
        value,
        v => {
          this._changeState(STATE_RESOLVED, v)
        },
        v => {
          this._changeState(STATE_REJECTED, v)
        },
      )
    } catch (error) {
      this._changeState(STATE_REJECTED, error)
    }
  }

  _reject(value) {
    if (this._resolveOrRejectCalled) {
      return
    }
    this._resolveOrRejectCalled = true
    this._changeState(STATE_REJECTED, value)
  }

  _execCallbacks() {
    while (this.chained.length) {
      const { resolve, reject, onFullfilled, onRejected, promise } = this.chained.shift()
      if (this._state === STATE_RESOLVED) {
        if (typeof onFullfilled === 'function') {
          try {
            const result = onFullfilled(this._value)
            if (result === promise) {
              throw new TypeError('Chaining cycle detected')
            }
            unwrap(result, resolve, reject)
          } catch (error) {
            reject(error)
          }
        } else {
          resolve(this._value)
        }
      } else {
        if (typeof onRejected === 'function') {
          try {
            const result = onRejected(this._value)
            if (result === promise) {
              throw new TypeError('Chaining cycle detected')
            }
            unwrap(result, resolve, reject)
          } catch (error) {
            reject(error)
          }
        } else {
          reject(this._value)
        }
      }
    }
  }

  then(onFullfilled, onRejected) {
    let _resolve
    let _reject
    const promise = new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
    this.chained.push({
      resolve: _resolve,
      reject: _reject,
      onFullfilled,
      onRejected,
      promise,
    })
    if (this._state !== STATE_PENDING) {
      makeAsync(this._execCallbacks.bind(this))
    }
    return promise
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }
}

module.exports = Promise
