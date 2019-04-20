const Promise = require('./src/promise')

const test1 = () => {
  const p1 = new Promise(resolve => {
    setTimeout(() => {
      resolve(1)
    }, 100)
  })
  const p2 = p1.then(value => {
    console.log(value)
    throw new Error('oops')
    // return value + 1
  })
  const p3 = p2.then(
    value => {
      console.log(value)
    }
    // err => {
    //   console.log(err.message, 'then catch')
    // }
  )
  const p4 = p3
    .catch(err => {
      console.log(err.message)
      return 'ok'
    })
    .then(() => {
      console.log('wtf')
    })

  setTimeout(() => {
    console.log(p1)
    console.log(p2)
    console.log('p3', p3)
    console.log('p4', p4)
  }, 500)
}

const test2 = () => {
  const p1 = new Promise((resolve, reject) => {
    resolve(Promise.reject(1))
  })
    .then(v => {
      console.log(v)
    })
    .catch(err => {
      console.log('err', err)
    })
}

const test3 = () => {
  Promise.resolve(Promise.resolve(1)).then(v => {
    console.log(v)
  })
}

// test2()
test3()
