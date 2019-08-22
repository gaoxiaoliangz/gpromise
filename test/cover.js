const aplus = require('promises-aplus-tests')
const adapter = require('./adapter')

describe('GPromise', function() {
  describe('Promises/A+ Tests', function() {
    aplus.mocha(adapter)
  })
})
