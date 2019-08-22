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
    // { reslove, reject, onFullfilled, onRejected }
    this.chained = []
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
      this._changeState(STATE_REJECTED, value)
    }
  }

  _execCallbacks() {
    while (this.chained.length) {
      const { resolve, reject, onFullfilled, onRejected } = this.chained.shift()
      if (this._state === STATE_RESOLVED) {
        if (typeof onFullfilled === 'function') {
          try {
            const result = onFullfilled(this._value)
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
    const promise = new Promise((resolve, reject) => {
      this.chained.push({
        resolve,
        reject,
        onFullfilled,
        onRejected,
      })
    })
    return promise
  }

  catch(onRejected) {
    this.then(null, onRejected)
  }
}

module.exports = Promise
