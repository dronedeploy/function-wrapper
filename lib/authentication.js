const request = require('request')

exports.getPublicKey = function (cb) {
  // example of mock
  process.nextTick(cb(null, [
    mockJWKS
  ]));
}
