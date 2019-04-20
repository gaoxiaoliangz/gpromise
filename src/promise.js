const STATE = {
  PENDING: 0,
  FULFILLED: 1,
  REJECTED: -1,
}

const isPromise = value =>
  (typeof value === 'object' || typeof value === 'function') &&
  typeof value.then === 'function'

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
    this._initProperty('state', STATE.PENDING)
    this._initProperty('value', undefined, {
      enumerable: true,
    })
    this._initProperty('fulfilledCallbacks', [])
    this._initProperty('rejectedCallbacks', [])
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
    const tasks =
      this.state === STATE.FULFILLED
        ? this.fulfilledCallbacks
        : this.rejectedCallbacks

    tasks.forEach(({ callback = v => v, resolveReturned, rejectReturned }) => {
      let thrownError
      let returned = this.value
      try {
        returned = callback(this.value)
      } catch (error) {
        thrownError = error
      }
      if (thrownError) {
        return rejectReturned(thrownError)
      }
      if (isPromise(returned)) {
        returned.then(resolveReturned, rejectReturned)
      } else {
        resolveReturned(returned)
      }
    })
  }

  _registerCallback(onFulfilled, onRejected) {
    let resolveReturned
    let rejectReturned
    const returnedPromise = new Promise((resolve, reject) => {
      resolveReturned = resolve
      rejectReturned = reject
    })
    this.fulfilledCallbacks.push({
      callback: onFulfilled,
      resolveReturned,
      rejectReturned,
    })
    if (typeof onRejected === 'function') {
      this.rejectedCallbacks.push({
        callback: onRejected,
        resolveReturned,
        rejectReturned,
      })
    }
    return returnedPromise
  }
}

module.exports = Promise
