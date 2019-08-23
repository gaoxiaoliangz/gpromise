// @ts-check
const STATE_PENDING = 'pending'
const STATE_RESOLVED = 'resolved'
const STATE_REJECTED = 'rejected'

let debugId = 0
const getDebugId = () => debugId++

const retriveThen = maybeThenable => {
  const then =
    maybeThenable !== null &&
    (typeof maybeThenable === 'object' || typeof maybeThenable === 'function') &&
    maybeThenable.then

  if (typeof then === 'function') {
    return then
  }
  return null
}

const makeAsync = setImmediate

const tryCatch = (fn, onSuccess, onError) => {
  try {
    onSuccess(fn())
  } catch (error) {
    onError(error)
  }
}

const createOneOffFn = fn => {
  let called = false
  return (...args) => {
    if (called) {
      return
    }
    called = true
    return fn(...args)
  }
}

const identity = v => v
const noop = () => {}

const unwrap = (maybeThenable, onUnwrapped, onError) => {
  tryCatch(
    () => retriveThen(maybeThenable),
    then => {
      if (then) {
        // maybe this is a bad design
        let callbackCalled = false
        return tryCatch(
          () =>
            then.call(
              maybeThenable,
              createOneOffFn(value => {
                if (callbackCalled) {
                  return
                }
                callbackCalled = true
                unwrap(value, onUnwrapped, onError)
              }),
              error => {
                if (callbackCalled) {
                  return
                }
                callbackCalled = true
                onError(error)
              },
            ),
          noop,
          execThenError => {
            if (callbackCalled) {
              return
            }
            callbackCalled = true
            onError(execThenError)
          },
        )
      }
      onUnwrapped(maybeThenable)
    },
    retriveThenError => onError(retriveThenError),
  )
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
    // { reslove, reject, onFullfilled, onRejected }[]
    this.chained = []
    this._state = STATE_PENDING
    this._value = null
    this._resolveOrRejectCalled = false
    this._debugId = getDebugId()
    executor(this._resolve.bind(this), this._reject.bind(this))
  }

  _changeState(state, value) {
    if (this._state === STATE_PENDING) {
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
    if (value === this) {
      return this._changeState(STATE_REJECTED, new TypeError('Chaining cycle detected'))
    }
    unwrap(
      value,
      unwrappedValue => {
        this._changeState(STATE_RESOLVED, unwrappedValue)
      },
      error => this._changeState(STATE_REJECTED, error),
      // this._reject.bind(this),
    )
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
      const { resolve, reject, onFullfilled, onRejected } = this.chained.shift()
      const cb = this._state === STATE_RESOLVED ? onFullfilled : onRejected
      tryCatch(() => cb(this._value), resolve, reject)
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
      onFullfilled: typeof onFullfilled === 'function' ? onFullfilled : identity,
      onRejected: typeof onRejected === 'function' ? onRejected : err => Promise.reject(err),
    })
    if (this._state !== STATE_PENDING) {
      makeAsync(this._execCallbacks.bind(this))
    }
    return promise
  }

  catch(onRejected) {
    return this.then.call(this, null, onRejected)
  }
}

module.exports = Promise
