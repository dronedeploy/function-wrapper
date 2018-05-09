const jsonwebtoken = require('jsonwebtoken');
const querystring = require('querystring');


/**
* decrypt ( token , jwk ) returns a decrypted token
* or raises error from jwt.verify
*/
exports.decrypt = function (token, key) {
  // we're veering from the standard and using PEM keys in the response from our server
  // so conversion from JWK to PEM is unnecessary
  // if we were to convert from JWK to PEM, it would look like: key = pemJwk.jwk2pem(key);
  return jsonwebtoken.verify(token, key);
};

/**
* parse (req) takes a nodejs incoming request as an argument
* and returns a jwt token from either an Authorization headers
* or query ?jwt_token.
* if neither is found, throw error
*/
exports.parse = function (req) {
  const authHeader = req.headers && req.headers.Authorization;
  const query = querystring.parse(req.query);
  const authQuery = query.jwt_token;

  if (authHeader)
    return authHeader.split('Bearer ')[1];
  if (authQuery)
    return authQuery;

  throw new Error('No JWT token provided.');
};
