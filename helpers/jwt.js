const jsonwebtoken = require('jsonwebtoken');

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
  // NodeJS applies lowercase to all incoming request headers, but let's leave the 'A' case
  // in just in case - won't hurt anything
  const authHeader = req.headers && (req.headers.Authorization || req.headers.authorization);
  const authQuery = req.query.jwt_token;
  // add a check for an embedded jwt_token in the state query param also (oauth spec)
  const stateQuery = req.query.state;

  if (authHeader)
    return authHeader.split('Bearer ')[1];
  if (authQuery)
    return authQuery;
  if (stateQuery) {
    // for auth purposes, stringified json
    try {
      const obj = JSON.parse(stateQuery);
      if (obj.jwt_token) {
        return obj.jwt_token;
      }
    } catch (e) {
      console.error(`state param did not parse as JSON ${e}`);
    }
  }

  throw new Error('No JWT token provided.');
};
