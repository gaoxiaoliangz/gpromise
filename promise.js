function doAsync(fn) {
  setTimeout(fn, 0)
}

function exec(promise, data, done) {
  if (promise) {
    const handler = promise.thenHandler
    const result = handler ? handler(data) : data
    if (result instanceof GPromise) {
      result.then(data => {
        exec(promise.next, data)
      })
    } else {
      doAsync(() => {
        exec(promise.next, result)
      })
    }
  } else if (done) {
    done()
  }
}

const PENDING = 0
const RESOLVED = 1
const REJECTED = 2
const INTERNAL = () => { }

function resolve(value) {
  const context = this

  context.state = RESOLVED
  context.value = value
  if (context.thenHandler) {
    exec(context, value)
  }
}

function reject(reason) {
  // todo
}

class GPromise {
  constructor(executor) {
    this.next = undefined
    this.value = undefined
    this.thenHandler = undefined
    this.state = PENDING

    if (executor !== INTERNAL) {
      doAsync(() => {
        executor(resolve.bind(this), reject.bind(this))
      })
    }
  }

  then(handler) {
    this.thenHandler = handler
    if (this.state === PENDING) {
      const promise = new GPromise(INTERNAL)
      this.next = promise
      return promise
    }

    if (this.state === RESOLVED) {
      const promise = new GPromise(resolve => {
        handler(this.value)
        resolve(this.value)
      })
      return promise
    }

    if (this.state === REJECTED) {
      // todo
    }
  }
}

module.exports = GPromise
