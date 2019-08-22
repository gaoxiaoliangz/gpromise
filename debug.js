// debug 2.3.3.3.1
const adapter = require('./test/adapter')
global.adapter = adapter
const thenables = require('./test/aplus-tests/helpers/thenables')

// unwrap check if onFullfilled called
const testUnwrapCheck = () => {
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

testUnwrapThrows()
