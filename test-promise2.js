const GPromise = require('./promise')

const promise = new GPromise((resolve, reject) => {
    // resolve('modified')
    reject('fucked')
})

