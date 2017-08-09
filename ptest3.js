const a = new Promise(resolve => {
  setTimeout(function () {
    resolve('ok')
  }, 1);
})
  .then(data => {
    // const b = a
    setTimeout(function () {
      const c = a
    }, 0)
    // return Promise.reject()
    return data
  })
  .then(() => { })
  // .catch(data => {
  //   console.log(data)
  // })
  .then(data => {
    console.log(data)
  })
