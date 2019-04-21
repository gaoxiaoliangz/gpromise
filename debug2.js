let adapter = require('./test/adapter')
global.adapter = adapter

const assert = require('assert')
var thenables = require('./test/aplus-tests/helpers/thenables')

const useNativePromise = process.argv.slice(2)[0] === '-n'

if (useNativePromise) {
  adapter = require('./test/adapter2')
}

console.log(`using ${useNativePromise ? 'native' : 'my'} promise\n`)

const deferred = adapter.deferred
const resolved = adapter.resolved
const rejected = adapter.rejected

const dummy = { dummy: 'dummy' }
const sentinel = { sentinel: 'sentinel' }
const other = { other: 'other' }

let count = 0
const specify = (desc, fn) => {
  const done = () => {
    count++
    console.log(desc, count)
  }
  // console.log(desc)
  fn(done)
}
const describe = specify

// ------------------------------------------------------------------------

function testCallingResolvePromiseRejectsWith(
  yFactory,
  stringRepresentation,
  rejectionReason
) {
  testCallingResolvePromise(yFactory, stringRepresentation, function(
    promise,
    done
  ) {
    promise.then(null, function onPromiseRejected(reason) {
      assert.strictEqual(reason, rejectionReason)
      done()
    })
  })
}

function testPromiseResolution(xFactory, test) {
  specify('via return from a fulfilled promise', function(done) {
    var promise = resolved(dummy).then(function onBasePromiseFulfilled() {
      return xFactory()
    })

    test(promise, done)
  })

  // specify("via return from a rejected promise", function (done) {
  //     var promise = rejected(dummy).then(null, function onBasePromiseRejected() {
  //         return xFactory();
  //     });

  //     test(promise, done);
  // });
}

function testCallingResolvePromiseFulfillsWith(
  yFactory,
  stringRepresentation,
  fulfillmentValue
) {
  testCallingResolvePromise(yFactory, stringRepresentation, function(
    promise,
    done
  ) {
    promise.then(function onPromiseFulfilled(value) {
      assert.strictEqual(value, fulfillmentValue)
      done()
    })
  })
}

function testCallingResolvePromise(yFactory, stringRepresentation, test) {
  describe('`y` is ' + stringRepresentation, function() {
    describe('`then` calls `resolvePromise` synchronously', function() {
      function xFactory() {
        return {
          then: function(resolvePromise) {
            resolvePromise(yFactory())
          },
        }
      }

      testPromiseResolution(xFactory, test)
    })

    // describe("`then` calls `resolvePromise` asynchronously", function () {
    //     function xFactory() {
    //         return {
    //             then: function (resolvePromise) {
    //                 setTimeout(function () {
    //                     resolvePromise(yFactory());
    //                 }, 0);
    //             }
    //         };
    //     }

    //     testPromiseResolution(xFactory, test);
    // });
  })
}

describe('`y` is a thenable for a thenable', function() {
  Object.keys(thenables.fulfilled).forEach(function(outerStringRepresentation) {
    var outerThenableFactory = thenables.fulfilled[outerStringRepresentation]

    Object.keys(thenables.fulfilled).forEach(function(
      innerStringRepresentation
    ) {
      console.log(outerStringRepresentation, innerStringRepresentation)
      var innerThenableFactory = thenables.fulfilled[innerStringRepresentation]

      var stringRepresentation =
        outerStringRepresentation + ' for ' + innerStringRepresentation

      function yFactory() {
        return outerThenableFactory(innerThenableFactory(sentinel))
      }

      testCallingResolvePromiseFulfillsWith(
        yFactory,
        stringRepresentation,
        sentinel
      )
    })

    Object.keys(thenables.rejected).forEach(function(
      innerStringRepresentation
    ) {
      var innerThenableFactory = thenables.rejected[innerStringRepresentation]

      var stringRepresentation =
        outerStringRepresentation + ' for ' + innerStringRepresentation

      function yFactory() {
        return outerThenableFactory(innerThenableFactory(sentinel))
      }

      testCallingResolvePromiseRejectsWith(
        yFactory,
        stringRepresentation,
        sentinel
      )
    })
  })
})
