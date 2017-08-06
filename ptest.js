const a = new Promise(resolve => {
  resolve(1)
  // setTimeout(function() {
  //   resolve(1)
  // }, 1);
})

const b = a.then(data => {
  // return new Promise(r => {
  //   r(2)
  // })
  return 2
})

const c = b.then(a => {
  return Promise.resolve(a)
})

setTimeout(() => {
  const obj = {
    a, b, c
  }
}, 200);
