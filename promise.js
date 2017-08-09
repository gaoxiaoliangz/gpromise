const PENDING = 0
const RESOLVED = 1
const REJECTED = 2
const INTERNAL = () => { }

function resolveNestedPromise(promise, onSuccess, onReject) {
  if (promise instanceof GPromise) {
    promise
      .then(data => {
        resolveNestedPromise(data, onSuccess, onReject)
      })
      .catch(err => {
        onReject(err)
      })
  } else {
    onSuccess(promise)
  }
}

function doAsync(fn) {
  setTimeout(fn, 0)
}

/**
 * @param {*} promise current promise that's been resolved
 */
function exec(promise) {
  if (promise.next) {
    let result

    if ((promise.state !== RESOLVED) && (promise.state !== REJECTED)) {
      console.error(`State should be ${RESOLVED} or ${REJECTED} instead of: ${promise.state}`)
      return
    }

    if (promise.state === RESOLVED && promise.thenHandler) {
      // 可能只有 catch 而没有 then
      result = promise.thenHandler(promise.value)
    }

    if (promise.state === REJECTED) {
      if (promise.rejectHandler) {
        result = promise.rejectHandler(promise.value)
      }
      return console.error('UnhandledPromiseRejectionWarning:', promise.value)
    }

    return resolveNestedPromise(
      result,
      (value) => {
        doAsync(() => {
          resolve.call(promise.next, value)
          exec(promise.next)
        })
      },
      (err) => {
        doAsync(() => {
          reject.call(promise.next, value)
          exec(promise.next)
        })
      })
  } else if (typeof done !== 'undefined') {
    done()
  }
}

function resolve(value) {
  const context = this

  context.state = RESOLVED
  context.value = value
  if (context.executor !== INTERNAL) {
    exec(context)
  }
}

function reject(reason) {
  const context = this

  context.state = REJECTED
  context.value = reason
  if (context.executor !== INTERNAL) {
    exec(context)
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
    this.next = undefined
    this.value = undefined
    this.thenHandler = undefined
    this.rejectHandler = undefined
    this.state = PENDING
    this.executor = executor

    if (executor !== INTERNAL) {
      doAsync(() => {
        executor(resolve.bind(this), reject.bind(this))
      })
    }
  }

  _registerChained(thenHandler, rejectHandler) {
    this.thenHandler = thenHandler
    this.rejectHandler = rejectHandler
    let promise

    if (this.state === PENDING) {
      promise = new GPromise(INTERNAL)
    }

    if (this.state === RESOLVED) {
      // this will start the new chain reaction
      promise = new GPromise(resolve => {
        resolve(thenHandler(this.value))
      })
    }

    if (this.state === REJECTED) {
      promise = new GPromise((resolve, reject) => {
        rejectHandler(this.value)
        reject(this.value)
      })
    }
    this.next = promise
    return promise
  }

  catch(rejectHandler) {
    return this._registerChained(undefined, rejectHandler)
  }

  then(thenHandler, rejectHandler) {
    const promise = this._registerChained(thenHandler, rejectHandler)
    return promise
  }
}

module.exports = GPromise
