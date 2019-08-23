// @ts-check
// debug 2.3.3.3.1
const adapter = require('./test/adapter')
// @ts-ignore
global.adapter = adapter
const thenables = require('./test/aplus-tests/helpers/thenables')

var resolved = adapter.resolved
var deferred = adapter.deferred

var dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it
var sentinel = { sentinel: 'sentinel' } // a sentinel fulfillment value to test for with strict equality
var other = { other: 'other' } // a value we don't want to be strict equal to

// unwrap check if onFullfilled called
const testFullfillTwice = () => {
  adapter
    .resolved(
      thenables.fulfilled['a thenable that tries to fulfill twice'](
        thenables.fulfilled['an asynchronously-fulfilled custom thenable'](1),
      ),
    )
    .then(v => {
      console.log('final result', v)
    })
    .catch(e => {
      console.log('error', e)
    })
}

// already-fulfilled promise
const testAlreadyFullfilled = () => {
  adapter
    .resolved(
      thenables.fulfilled['an asynchronously-fulfilled custom thenable'](
        thenables.fulfilled['an already-fulfilled promise'](1),
      ),
    )
    .then(v => {
      console.log('final result', v)
    })
    .catch(e => {
      console.log('error', e)
    })

  const p100 = adapter.resolved(100)

  setTimeout(() => {
    p100.then(v => {
      console.log('p100', v)
    })
    console.log('after p100')
  }, 100)
}

const testUnwrapThrows = () => {
  adapter
    .resolved(
      thenables.fulfilled['a thenable that fulfills but then throws'](
        thenables.fulfilled['an asynchronously-fulfilled custom thenable'](1),
      ),
    )
    .then(v => {
      console.log('final result', v)
    })
    .catch(e => {
      console.log('error', e)
    })
}

const testResolveNestedThenablesThatFullfillsTwice = () => {
  adapter
    .resolved(
      thenables.fulfilled['a thenable that tries to fulfill twice'](
        // thenables.fulfilled['an already-fulfilled promise'](1),
        1,
      ),
    )
    .then(v => {
      console.log('final result', v)
    })
    .catch(e => {
      console.log('error', e)
    })
}

const testRejectSelf = () => {
  const p1 = adapter.rejected(1).catch(err => {
    return p1
    // return adapter.rejected(2)
    // throw adapter.rejected(2)
    // return adapter.resolved(10)
  })

  p1.then(v => {
    console.log('val', v)
  }).catch(err => {
    console.log('err', err)
  })
}

const testOnFulfilledThrow = () => {
  adapter
    .resolved()
    .then(() => {
      throw null
    })
    .catch(e => {
      console.log(e)
    })
}

const testRetrivingThen = () => {
  const thenable = {
    then: () => {
      throw new Error('not this')
    },
  }

  const func = () => {}
  func.then = thenable.then
  const bo = true
  // @ts-ignore
  bo.then = thenable.then

  adapter
    .resolved()
    .then(() => {
      // return thenable
      // return func
      return bo
    })
    .then(v => {
      console.log(v)
    })
    .catch(e => {
      console.log('err', e)
    })
}

const testReject = () => {
  const deferred = adapter.deferred()

  // not ok
  // deferred.resolve(deferred.promise)

  // ok
  deferred.reject(deferred.promise)

  deferred.promise
    .then(v => {
      console.log(v)
    })
    .catch(e => {
      console.log('err', e)
    })
}

const testThenableReject = () => {
  const thenable = {
    then: (cb, onRejected) => {
      // cb(1)
      throw new Error('not this')
      // onRejected(2)
      // onRejected(adapter.resolved(2))
    },
  }

  adapter
    .resolved(1)
    .then(v => {
      return thenable
    })
    .then(v => {
      console.log('> result:', v)
    })
    .catch(e => {
      console.log('> error:', e)
    })
}

// calling `resolvePromise` with an asynchronously-fulfilled promise, then calling " +"`rejectPromise`, both synchronously
const testResolveThenReject = () => {
  function xFactory() {
    var d = adapter.deferred()
    setTimeout(function() {
      d.resolve({ s: 1 })
    }, 50)

    return {
      then: function(resolvePromise, rejectPromise) {
        resolvePromise(d.promise)
        rejectPromise(other)
      },
    }
  }

  adapter
    .resolved({ x: 1 })
    // .rejected()
    .then(() => {
      return xFactory()
    })
    .then(v => {
      console.log('> result:', v)
    })
    .catch(e => {
      console.log('> error:', e)
    })
}

// testFullfillTwice()
// testAlreadyFullfilled()
// testUnwrapThrows()
// testResolveNestedThenablesThatFullfillsTwice()
// testRejectSelf()
// testOnFulfilledThrow()
// testRetrivingThen()
// testReject()
// testThenableReject()
testResolveThenReject()
