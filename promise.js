// function exec(handlers, initialData, done) {
//   let index = 0
//   const _exec = (data) => {
//     handler = handlers[index]
//     index++
//     if (index <= handlers.length) {
//       const result = handler(data)
//       if (result instanceof GPromise) {
//         result.then(data => {
//           _exec(data)
//         })
//       } else {
//         _exec(result)
//       }
//     } else {
//       done()
//     }
//   }
//   _exec(initialData)
// }

function exec(context, initialData, done) {

  const _exec = (data) => {
    if (context.next) {
      const result = handler(data)
      if (result instanceof GPromise) {
        result.then(data => {
          _exec(data)
        })
      } else {
        _exec(result)
      }
    } else if(done) {
      done()
    }
  }
  _exec(initialData)
}

const PENDING = 0
const RESOLVED = 1
const REJECTED = 2
const INTERNAL = () => { }

function resolve(value) {
  const context = this

  context.state = RESOLVED
  context.value = value
  context.thenHandler(value)

  exec(context, value)
  // const done = () => {
  //   context.queue = []
  // }


  // if (context.queue.length === 0) {
  //   exec([value => value], value, done)
  // } else {
  //   exec(context.queue, value, done)
  // }
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
      executor(resolve.bind(this), reject.bind(this))
    }
  }

  then(handler) {
    this.thenHandler = handler
    if (this.state === RESOLVED || this.state === PENDING) {
      const promise = new GPromise(INTERNAL)
      this.next = promise
      return promise
    }

    if (this.state === REJECTED) {
      // todo
    }
  }
}

// test promise
function delaySomeTime(t) {
  return new GPromise(resolve => {
    // return new Promise(resolve => {
    setTimeout(function () {
      resolve(`time delayed ${t}`)
    }, t);
  })
}

// delaySomeTime(1000)
const a = delaySomeTime(1000)
  .then(data => {
    console.log(data, '1')
    return data
    // return new GPromise(resolve => {
    //   resolve('hahahas')
    // })
  })
  .then(data => {
    console.log(data, '2')
    // return data + 'moded'
    // return new GPromise(resolve => {
    //   resolve('hahahas')
    // })
    return data
  })

// a.then(data => {
//   console.log(data, '3')
//   return data
// })
