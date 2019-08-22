// const p1 = Promise.resolve(1)

// const p2 = Promise.reject(10)
//   .catch(v => {
//     return p2
//   })
//   .catch(e => {
//     console.log(e)
//   })

const dummy = {}

const resolved = (v) => {
  return Promise.resolve(v)
}

var promise = resolved(dummy).then(function() {
  return promise
})

promise.then(null, function(reason) {
  // assert(reason instanceof TypeError)
  // done()
  console.log(reason)
})
