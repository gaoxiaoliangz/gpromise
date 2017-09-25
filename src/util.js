const { PENDING, RESOLVED, REJECTED, INTERNAL } = require('./constants')

function doAsync(fn) {
  setTimeout(function () {
    fn.call(null)
  }, 0)
}

exports.doAsync = doAsync

function isPromise(promise) {
  // 2.3.3.1: promise 也可能是带有 then 的 function
  return promise && (promise instanceof Object || typeof promise === 'object') && ('then' in promise)
}

exports.isPromise = isPromise

/**
 * 等待所有 Promise 依赖的所有 Promise 变为 resolved 或者其中一个 rejected
 * （如果一个 Promise resolve 的值是一个状态为 pending 的 Promise 那么，这个
 * Promise 仍然是 pending 的状态）
 * @param {GPromise} promise 
 * @param {function} done
 */
function untilFullfill(promise, done) {
  if (isPromise(promise)) {
    let isFullfilled = false
    try {
      // const then = promise.then
      // if (typeof then === 'function') {
      promise.then(data => {
        if (isPromise(data)) {
          untilFullfill(data, done)
        } else {
          done(RESOLVED, data)
          isFullfilled = true
        }
      }, err => {
        done(REJECTED, err)
      })
      // } else {
      //   done(RESOLVED, promise)
      // }
    } catch (err) {
      if (!isFullfilled) {
        done(REJECTED, err)
      }
    }
  } else {
    throw new Error('Not a promise!')
  }
}

exports.untilFullfill = untilFullfill
