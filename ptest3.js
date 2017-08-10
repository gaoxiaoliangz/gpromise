// const a = new Promise(resolve => {
//   setTimeout(function () {
//     resolve('ok')
//   }, 1);
// })
//   .then(data => {
//     // const b = a

//     // return Promise.resolve(2)
//     // return data
//     const p = new Promise(resolve => {
//       resolve('ok2')
//     })

//     setTimeout(function () {
//       const c = a
//     }, 0)
//     return p
//   })


// .then(() => { })
// // .catch(data => {
// //   console.log(data)
// // })
// .then(data => {
//   console.log(data)
// })


// console.log('before promise')
// // const b = Promise.resolve(1).then(data => data)
// const b = new Promise(resolve => {
//   console.log('in promise')
//   const promise = new Promise(_resolve => {
//     console.log('in sub promise')
//     setTimeout(function () {
//       console.log('promise')
//       _resolve(2)
//     }, 10);
//     _resolve(2)
//   })
//   resolve(1)
// })

// console.log('after promise')

// const a = new Promise(resolve => {
//   setTimeout(function() {
//     resolve(1)
//   }, 1000)
// })




// setTimeout(function() {
//   const b = a
// }, 2000);

// function recur(a) {
//   if (a > 20) {
//     return a
//   } else {
//     setTimeout(function() {
//       recur(a + 1)
//     }, 1)
//   }
// }

// const a = recur(2)

// setTimeout(function() {
//   const c = a
// }, 200)


// fullfill
// function delaySomeTime(t) {
//   return new Promise(resolve => {
//     setTimeout(function () {
//       resolve(`time delayed ${t}`)
//     }, t);
//   })
// }


// function untilFullfill(promise, done) {
//   if (promise instanceof Promise) {
//     promise
//       .then(data => {
//         if (data instanceof Promise) {
//           untilFullfill(data, done)
//         } else {
//           done(promise)
//         }
//       }, err => {
//         done(promise)
//       })
//   } else {
//     throw new Error('Not a promise!')
//   }
// }

// // const a = delaySomeTime(10)
// const a = new Promise(resolve => {
//   resolve(delaySomeTime(1000).then(data => {
//     return Promise.reject(data + 'no')
//   }))
// })

// untilFullfill(a, pro => {
//   const b = pro
//   b.then(data => {
//     const c = data
//     console.log(data)
//   })
//     .catch(err => {
//       console.log(err)
//     })
// })


const b = Promise.reject(1)

const a = new Promise(resolve => {
  resolve(b)
})

setTimeout(function() {
  const _a = a
}, 1)
