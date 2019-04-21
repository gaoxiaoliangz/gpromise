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

const unwrap = (maybePromise, cb, onError) => {
  try {
    if (
      (typeof maybePromise === 'object' ||
        typeof maybePromise === 'function') &&
      maybePromise !== null
    ) {
      const then = maybePromise.then
      if (typeof then === 'function') {
        let called = false
        return then.call(
          maybePromise,
          // 这边的逻辑可能被外部的 promise 实现执行多次
          v => {
            if (called) {
              return
            }
            called = true
            // 这里有些难理解 2.3.3.3.1
            unwrap(v, cb, onError)
          },
          err => {
            if (called) {
              return
            }
            called = true
            onError(err)
          }
        )
      }
      return cb(maybePromise)
    }
    return cb(maybePromise)
  } catch (error) {
    onError(error)
  }
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
    this._initProperty('resolveOrRejectCalled', false)
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
    if (this.resolveOrRejectCalled) {
      return
    }
    this.resolveOrRejectCalled = true
    if (this.state === STATE.PENDING) {
      const change = (s, v) => {
        nextTick(() => {
          this.state = s
          this.value = v
          // TODO: 检查是否处理了 rejection，不一定是接下来的 then，可能这个链很长
          // if (s === STATE.REJECTED && this.callbacks.filter(c => typeof c.onRejected === 'function')) {
          //   console.log('Promise rejection is not handled')
          // }
          this._executeCallbacks()
        })
      }

      // reject 一个 promise 不需要等待完成
      if (state === STATE.REJECTED) {
        change(state, value)
      } else {
        unwrap(value, v => change(state, v), err => change(STATE.REJECTED, err))
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
        returnedPromise,
      } = callback

      const handleReturned = returned => {
        if (returned === returnedPromise) {
          return rejectReturned(new TypeError(`Cannot resolve using self`))
        }
        unwrap(returned, resolveReturned, rejectReturned)
      }

      // execute callback
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

      // handle callback exception & return value
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
      returnedPromise,
    })
    if (this.state !== STATE.PENDING) {
      this._executeCallbacks()
    }
    return returnedPromise
  }
}

module.exports = Promise
