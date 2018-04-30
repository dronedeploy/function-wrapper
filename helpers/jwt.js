const jwt = require('jsonwebtoken');
const pemJwk = require('pem-jwk');

/**
* decrypt ( token , jwk ) returns a decrypted token
* or raises error from jwt.verify
*/
exports.decrypt = function (token, jwk) {
    let pem = pemJwk.jwk2pem(jwk);
    return jwt.verify(token, pemkey);
}

/**
* parse (req) takes a nodejs incoming request as an argument
* and returns a jwt token from either an Authorization headers
* or query ?jwt_token.
* if neither is found, throw error
*/
exports.parse = function (req) {
  authHeader = req.headers['Authorization'];
  authQuery = req.query['jwt_token'];
  authError = new Error('No JWT token provided.');
  if (authHeader) return authHeader.split('Bearer ')[1];
  if (authQuery) return authQuery;
  throw authError;
}
