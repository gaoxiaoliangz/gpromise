const GPromise = require('./promise')

function delaySomeTime(t) {
  return new GPromise(resolve => {
    setTimeout(function () {
      resolve(`time delayed ${t}`)
    }, t);
  })
}

delaySomeTime(1000)
  .then(dataA => {
    console.log(dataA, '1')
    return new GPromise(resolve => {
      resolve('modified')
    })
      .then(dataC => {
        return dataC + '(mod)'
      })
  })
  .then(dataB => {
    console.log(dataB, '2')
    return new GPromise(resolve => {
      resolve(dataB + '(done)')
    })
      .then(data => {
        console.log(data)
      })
  })
