const a = new Promise(resolve => {
  setTimeout(() => {
    console.log('from a')
    resolve('aaa')
  }, 1000)
})
  .then(data => {
    console.log(data + ', a')
  })

const b = new Promise(resolve => {
  setTimeout(() => {
    console.log('from b')
    resolve('bbb')
  }, 1000)
})
  .then(data => {
    console.log(data + ', b')
  })