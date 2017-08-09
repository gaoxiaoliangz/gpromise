const PENDING = 0
const RESOLVED = 1
const REJECTED = 2
const INTERNAL = () => { }


function doAsync(fn) {
  setTimeout(fn, 0)
}

/**
 * @param {*} promise current promise that's been resolved
 */
function exec(promise) {
  const nextPromise = promise.next
  if (nextPromise && nextPromise.next) {
    // let resolvedData
    // let _reject = false

    // const resolvePromise = (callback) => {
    switch (nextPromise.state) {
      case PENDING:
        // result.then(data => {
        //   exec({
        //     promise: promise.next, data
        //   })
        // })
        let result
        if (promise.state === RESOLVED) {
          if (nextPromise.thenHandler) {
            result = nextPromise.thenHandler ? nextPromise.thenHandler(promise.value) : promise.value
          }
          return false
        }

        const next = () => {
          doAsync(() => {
            exec(promise.next, promise)
          })
        }

        if (result instanceof GPromise) {
          result.then(data => {
            next()
            return data
          })
        } else {
          next()
        }

        break

      // case RESOLVED:
      //   resolvedData = promise.thenHandler ?  promise.thenHandler(promise.value) : promise.value
      //   break

      // case REJECTED:
      //   exec({
      //     promise: promise.next, data: promise.rejectReason, reject: true
      //   })
      //   break

      default:
        console.error(`State should always be ${PENDING} instead of: ${promise.state}`)
        break
    }

    // doAsync(() => {
    //   exec({
    //     promise: promise.next, data, reject: _reject
    //   })
    // })

    // const handler = reject ? promise.rejectHandler : promise.thenHandler
    // const result = handler ? handler(data) : data
    // if (reject && !handler) {
    //   console.error('UnhandledPromiseRejectionWarning:', data)
    //   return false
    // }
    // if (result instanceof GPromise) {
    //   switch (result.state) {
    //     case PENDING:
    //       result.then(data => {
    //         exec({
    //           promise: promise.next, data
    //         })
    //       })
    //       break

    //     case RESOLVED:
    //       exec({
    //         promise: promise.next, data: promise.value
    //       })
    //       break

    //     case REJECTED:
    //       exec({
    //         promise: promise.next, data: promise.rejectReason, reject: true
    //       })
    //       break

    //     default:
    //       console.error(`Unkonwn state: ${result.state}`)
    //       break
    //   }
    // } else {
    //   doAsync(() => {
    //     exec({
    //       promise: promise.next, data: result, reject
    //     })
    //   })
    // }
    // }
  } else if (done) {
    done()
  }
}

function resolve(value) {
  const context = this

  context.state = RESOLVED
  context.value = value
  if (context.thenHandler) {
    exec(context, GPromise.resolve(value))
  }
}

function reject(reason) {
  const context = this

  context.state = REJECTED
  context.value = reason
  if (context.rejectHandler) {
    exec(context, GPromise.reject(reason))
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

    if (executor !== INTERNAL) {
      doAsync(() => {
        executor(resolve.bind(this), reject.bind(this))
      })
    }
  }

  _registerChained(thenHandler, rejectHandler) {
    if (this.state === PENDING) {
      const promise = new GPromise(INTERNAL)
      this.thenHandler = (value) => {
        thenHandler(value)
        promise.state = RESOLVED
      }
      this.next = promise
      return promise
    }

    if (this.state === RESOLVED) {
      // this will start the new chain reaction
      const promise = new GPromise(resolve => {
        thenHandler(this.value)
        resolve(this.value)
      })
      return promise
    }

    if (this.state === REJECTED) {
      const promise = new GPromise((resolve, reject) => {
        rejectHandler(this.value)
        reject(this.value)
      })
      return promise
    }
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
