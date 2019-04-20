const STATE = {
  PENDING: 0,
  FULFILLED: 1,
  REJECTED: -1,
}

const isPromise = value => {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    typeof value.then === 'function'
  )
}

const tryCatch = fn => {
  try {
    return [fn(), false]
  } catch (error) {
    return [error, true]
  }
}

const nextTick = setImmediate

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
    this._initProperty('state', STATE.PENDING, {
      enumerable: true,
    })
    this._initProperty('value', undefined, {
      enumerable: true,
    })
    this._initProperty('callbacks', [])
    this._initProperty('then', this._registerCallback)
    this._initProperty('catch', this._registerCallback.bind(this, null))
    executor(this._resolve.bind(this), this._reject.bind(this))
  }

  _initProperty(key, value, config) {
    Object.defineProperty(this, key, {
      enumerable: false,
      value,
      writable: true,
      ...config,
    })
  }

  _changeState(state, value) {
    if (this.state === STATE.PENDING) {
      const change = (s, v) => {
        nextTick(() => {
          this.state = s
          this.value = v
          this._executeCallbacks()
        })
      }

      if (isPromise(value)) {
        value.then(
          v => {
            change(state, v)
          },
          err => {
            change(STATE.REJECTED, err)
          }
        )
      } else {
        change(state, value)
      }
    }
  }

  _resolve(value) {
    this._changeState(STATE.FULFILLED, value)
  }

  _reject(value) {
    this._changeState(STATE.REJECTED, value)
  }

  _executeCallbacks(callbacks = this.callbacks) {
    // 在 callback 执行阶段也有可能注册新的回调
    callbacks.forEach(callback => {
      const {
        onFulfilled,
        onRejected,
        resolveReturned,
        rejectReturned,
      } = callback

      const handleReturned = returned => {
        if (isPromise(returned)) {
          return returned.then(resolveReturned, rejectReturned)
        }
        resolveReturned(returned)
      }

      const [returned, hasError] = tryCatch(() => {
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

      callback.executed = true

      if (hasError) {
        return rejectReturned(returned)
      }
      return handleReturned(returned)
    })

    const cbs = this.callbacks.filter(c => c.executed === false)
    if (cbs.length) {
      this._executeCallbacks(cbs)
    }
  }

  _registerCallback(onFulfilled, onRejected) {
    let resolveReturned
    let rejectReturned
    const returnedPromise = new Promise((resolve, reject) => {
      resolveReturned = resolve
      rejectReturned = reject
    })
    this.callbacks.push({
      executed: false,
      onFulfilled,
      onRejected,
      resolveReturned,
      rejectReturned,
    })
    return returnedPromise
  }
}

module.exports = Promise
