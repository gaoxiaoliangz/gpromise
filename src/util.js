const { PENDING, RESOLVED, REJECTED, INTERNAL } = require('./constants')

function doAsync(fn) {
  setTimeout(function () {
    fn.call(null)
  }, 0)
}

exports.doAsync = doAsync

// function getThenResultIfAny(promise, done, errorCallback) {
//   try {

//     if (promise && (promise instanceof Object || typeof promise === 'object') && ('then' in promise)) {
//       const then = promise.then
//       if (typeof then === 'function') {
//         done(then)
//       }
//     }
//     return
//   } catch (error) {
//     errorCallback(error)
//   }
// }

function isPromise(promise) {
  // 2.3.3.1: promise 也可能是带有 then 的 function
  return promise && (promise instanceof Object || typeof promise === 'object') && ('then' in promise)
}

exports.isPromise = isPromise

/**
 * @param {GPromise} promise 
 * @param {function} done
 */
function unwrap(promise, done) {
  if (isPromise(promise)) {
    let isFullfilled = false
    try {
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
    } catch (err) {
      if (!isFullfilled) {
        done(REJECTED, err)
      }
    }
  } else {
    done(RESOLVED, promise)
  }
}

exports.unwrap = unwrap
