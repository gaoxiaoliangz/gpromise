const Promise = require('./src/promise')

// new Promise(resolve => {
//   setTimeout(() => {
//     resolve(1)
//   }, 100)
// })
//   .then(value => {
//     console.log(value)
//     throw new Error('oops')
//     // return value + 1
//   })
//   .then(
//     value => {
//       console.log(value)
//     },
//     err => {
//       console.log(err.message, 'then catch')
//     }
//   )
//   .catch(err => {
//     console.log(err.message)
//   })

// console.log('start')

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
const p4 = p3.catch(err => {
  console.log(err.message)
  return 'ok'
})
// .then(() => {
//   console.log('wtf')
// })

// setTimeout(() => {
//   console.log(p1)
//   console.log(p2)
//   console.log('p3', p3)
//   console.log('p4', p4)
// }, 500)
