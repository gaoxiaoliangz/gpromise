const PENDING = 0
const RESOLVED = 1
const REJECTED = 2
const INTERNAL = () => { }



function findClosest(promise, key) {
  if (!promise) {
    return
  }
  if (promise[key]) {
    return promise
  } else {
    return findClosest(promise.next, key)
  }
}

/**
 * 等待所有 Promise 依赖的所有 Promise 变为 resolved 或者其中一个 rejected
 * （如果一个 Promise resolve 的值是一个状态为 pending 的 Promise 那么，这个
 * Promise 仍然是 pending 的状态）
 * @param {GPromise} promise 
 * @param {function} done
 */
function untilFullfill(promise, done) {
  // todo: work with other implementations of Promise
  if (promise instanceof GPromise) {
    promise
      .then(data => {
        if (data instanceof GPromise) {
          untilFullfill(data, done)
        } else {
          done(promise)
        }
      }, err => {
        done(promise)
      })
  } else {
    throw new Error('Not a promise!')
  }
}


// proto fns using bind
function registerChained(thenHandler, rejectHandler) {
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
      reject(rejectHandler(this.value))
    })
  }
  this.next = promise
  return promise
}

function resolve(promise, value) {
  // this.state = RESOLVED
  this.value = value
  if (this.executor !== INTERNAL) {
    resolveChained(this)
  }
}

function reject(reason) {
  this.state = REJECTED
  this.value = reason
  if (this.executor !== INTERNAL) {
    resolveChained(this)
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

    executor(resolve.bind(this), reject.bind(this))
  }

  catch(rejectHandler) {
    return registerChained.call(this, undefined, rejectHandler)
  }

  then(thenHandler, rejectHandler) {
    return registerChained.call(this, thenHandler, rejectHandler)
  }
}
