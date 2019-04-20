const STATE = {
  PENDING: 0,
  FULFILLED: 1,
  REJECTED: -1,
}

const isPromise = value =>
  (typeof value === 'object' || typeof value === 'function') &&
  typeof value.then === 'function'

const tryCatch = fn => {
  try {
    return [fn(), null]
  } catch (error) {
    return [null, error]
  }
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
    executor(this._resolve.bind(this), this._reject.bind(this))
    this._initProperty('state', STATE.PENDING, {
      enumerable: true,
    })
    this._initProperty('value', undefined, {
      enumerable: true,
    })
    this._initProperty('callbacks', [])
    this._initProperty('then', this._registerCallback)
    this._initProperty('catch', this._registerCallback.bind(this, null))
  }

  _initProperty(key, value, config) {
    Object.defineProperty(this, key, {
      enumerable: false,
      value,
      writable: true,
      ...config,
    })
  }

  _resolve(value) {
    if (isPromise(value)) {
    } else if (this.state === STATE.PENDING) {
      this.state = STATE.FULFILLED
      this.value = value
      this._executeCallbacks()
    }
  }

  _reject(value) {
    if (isPromise(value)) {
    } else if (this.state === STATE.PENDING) {
      this.state = STATE.REJECTED
      this.value = value
      this._executeCallbacks()
    }
  }

  _executeCallbacks() {
    this.callbacks.forEach(
      ({ onFulfilled, onRejected, resolveReturned, rejectReturned }) => {
        let returned = this.value
        let error
        const handleReturned = returned => {
          if (isPromise(returned)) {
            return returned.then(resolveReturned, rejectReturned)
          }
          resolveReturned(returned)
        }

        ;[returned, error] = tryCatch(() => {
          if (this.state === STATE.FULFILLED) {
            if (typeof onFulfilled === 'function') {
              return onFulfilled(this.value)
            }
            return this.value
          }
          if (typeof onRejected === 'function') {
            return onRejected(this.value)
          }
          throw this.value
        })

        if (error) {
          return rejectReturned(error)
        }
        return handleReturned(returned)
      }
    )
  }

  _registerCallback(onFulfilled, onRejected) {
    let resolveReturned
    let rejectReturned
    const returnedPromise = new Promise((resolve, reject) => {
      resolveReturned = resolve
      rejectReturned = reject
    })
    this.callbacks.push({
      onFulfilled,
      onRejected,
      resolveReturned,
      rejectReturned,
    })
    return returnedPromise
  }
}

module.exports = Promise
