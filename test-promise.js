const GPromise = require('./promise')

function delaySomeTime(t) {
  return new GPromise(resolve => {
    setTimeout(function () {
      resolve(`time delayed ${t}`)
    }, t);
  })
}

const a = new GPromise((resolve, reject) => {
  setTimeout(function () {
    reject('timer')
  }, 200)
})

new GPromise(resolve => {
  resolve(a.then(d => {
    return d
  }))
  // resolve(a)
})
  .catch(err => {
    console.log(err)
  })
  // .then(data => {
  //   return data + 'mod'
  // })
  // .catch(err => {
  //   console.log(err)
  // })

// delaySomeTime(1000)
//   .then(data => {
//     console.log(data)
//     // return data + ' a'
//     return new GPromise((resolve, reject) => {
//       setTimeout(function () {
//         reject(data + 'timer')
//       }, 200)
//     })
//       .then(data => {
//         return data + 'mod'
//       })
//   })
//   .catch(data => {
//     console.log(data)
//     return data + ' c'
//   })
//   .then(data => {
//     console.log(data)
//     return data + ' d'
//   })

// const a = delaySomeTime(1000)
//   .then(dataA => {
//     console.log(dataA, '1')
//     const promise = new GPromise((resolve, reject) => {
//       // resolve('modified')
//       reject('fucked')
//     })

//     return promise
//       .then(dataC => {
//         return dataC + '(mod)'
//         // return GPromise.reject(dataC + 'fucked2222')
//       })
//   })
//   .catch(dataB => {
//   // .then(dataB => {
//     console.log(dataB, '2')
//     return new GPromise(resolve => {
//       resolve(dataB + '(done)')
//     })
//       .then(data => {
//         console.log(data)
//       })
//   })

// const delaySomeTime2 = (t) => {
//   return new Promise(resolve => {
//     setTimeout(function () {
//       resolve(`time delayed ${t}`)
//     }, t);
//   })
// }

// delaySomeTime2(1000)
//   .then(dataA => {
//     console.log(dataA, '1')
//     return new Promise((resolve, reject) => {
//       // resolve('modified')
//       reject('fucked earlier')
//     })
//       .then(dataC => {
//         // return dataC + '(mod)'
//         // return Promise.reject('fucked')
//         return new Promise((resolve, reject) => {
//           reject('fucked')
//         })
//       })
//   })
//   // .catch(err => {
//   //   console.log(err)
//   //   return err
//   // })
//   // .then(data => {}, err => {
//   //   return err
//   // })
//   .then(dataB => {
//     console.log(dataB, '2')
//     return new Promise(resolve => {
//       resolve(dataB + '(done)')
//     })
//       .then(data => {
//         console.log(data)
//       })
//   })

