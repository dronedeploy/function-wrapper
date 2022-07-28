const fetch = require('node-fetch');
const dotenv = require('dotenv');
const util = require('util');
const api = require('../helpers/api');
const jwt = require('../helpers/jwt');

globalizeAppId();

function WrongAudienceError(message) {
  this.message = message;
  Error.captureStackTrace(this, WrongAudienceError);
}
util.inherits(WrongAudienceError, Error);
WrongAudienceError.prototype.name = 'WrongAudienceError';
exports.WrongAudienceError = WrongAudienceError;

exports.getPublicKeys = function () {
  const baseUrl = api.getBaseUrl();
  const endpoint = `${baseUrl}/api/v1/jwt_public_keys`;
  return fetch(endpoint)
    .then(function (response) {
      console.log("successfully fetched public keys");
      return response.json();
    })
    .then(function (data) {
      // get list of keys from data
      return data.map(keyObj => keyObj.key);
    });
};

/**
 * Attempt decrypting an encrypted JWT with the given keys.
 *
 * @param token the encrypted JWT to decrypt
 * @param keys a list of keys with which to attempt decryption
 * @returns {*} a decrypted JWT
 * @throws the last error encountered while attempting decryption with the given keys if all decryption attempts failed
 */
exports.decryptTokenWithKeys = function (token, keys) {
  let i, key, decryptedToken, lastError;
  for (i = 0; i < keys.length; ++i) {
    key = keys[i];
    // attempt decryption
    try {
      decryptedToken = jwt.decrypt(token, key);
      console.log("succssfully decrpyed token with keys");
      return decryptedToken;
    } catch (e) {
      console.log("error decrpying token with keys")
      lastError = e;
    }
  }
  // could not decrypt token with any of the fetched public keys
  throw lastError;
};

/**
 * Verify that the audience in the JWT is set correctly for this Function.
 *
 * @param token the JWT whose audience is to be verified
 * @param audiences if any of the audiences in the token match those in this list, the token verifies; defaults to this Function's audience
 * @returns {boolean}
 */
exports.verifyAudience = function (token, audiences) {
  const tokenAudience = new Set(token.aud || []);
  const names = ["FUNCTION_ID", "APP_ID"];
  if (!audiences) {
    audiences = [];
    for (const name of names) {
      if (global[name]) {
        audiences.push(global[name]);
      }
    }
  }

  const intersection = audiences.filter(function (aud) {
    return tokenAudience.has(aud);
  });

  if (!!intersection.length) {
    console.log(`verify audiences failed: possibly missing ${names}`)
  }

  return !!intersection.length;
};

function globalizeAppId() {
  dotenv.config();
  global.APP_ID = process.env.APP_ID;
  if (!global.APP_ID) {
    const msg = 'App id not available, did you deploy using DroneDeploy-Cli?';
    throw new Error(msg);
  }
}
