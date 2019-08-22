// @ts-check
const STATE_PENDING = 'pending'
const STATE_RESOLVED = 'resolved'
const STATE_REJECTED = 'rejected'

const getThen = maybeThenable => {
  // TODO: handle retrive error
  const then = maybeThenable && maybeThenable.then

  if (typeof then === 'function') {
    return then
  }
  return null
}

const unwrap = (maybeThenable, resolve, reject) => {
  const then = getThen(maybeThenable)
  if (then) {
    return then.call(maybeThenable, resolve, reject)
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
    this._successCallbacks = []
    this._failureCallbacks = []
    // if child promise has no _failureCallbacks & state is rejected
    // this will be executed
    this._childPromiseRejects = []
    this._state = STATE_PENDING
    this._value = null
    executor(this._resolve.bind(this), this._reject.bind(this))
  }

  _changeState(state, value) {
    this._state = state
    this._value = value
    setImmediate(this._execCallbacks.bind(this))
  }

  _resolve(value) {
    if (this._state === STATE_PENDING) {
      unwrap(
        value,
        v => {
          this._changeState(STATE_RESOLVED, v)
        },
        v => {
          this._changeState(STATE_REJECTED, v)
        },
      )
    }
  }

  _reject(value) {
    if (this._state === STATE_PENDING) {
      unwrap(
        value,
        v => {
          this._changeState(STATE_REJECTED, v)
        },
        () => {
          this._changeState(STATE_REJECTED, value)
        },
      )
    }
  }

  _execCallbacks() {
    let callbacks = this._state === STATE_RESOLVED ? this._successCallbacks : this._failureCallbacks
    if (this._state === STATE_REJECTED && callbacks.length === 0) {
      callbacks = this._childPromiseRejects
    }
    while (true) {
      const cb = callbacks.shift()
      if (cb) {
        cb(this._value)
      } else {
        break
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

    if (!onRejected) {
      this._childPromiseRejects.push(_reject)
    }
    if (typeof onFullfilled === 'function') {
      this._successCallbacks.push(value => {
        const result = onFullfilled(value)
        unwrap(result, _resolve, _reject)
      })
    }
    if (typeof onRejected === 'function') {
      this._failureCallbacks.push(value => {
        const result = onRejected(value)
        unwrap(result, _resolve, _reject)
      })
    }
    return promise
  }

  catch(onRejected) {
    this.then(null, onRejected)
  }
}

module.exports = Promise
