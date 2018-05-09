const jwt = require('./helpers/jwt');
const modules = require('./modules');
const authentication = require('./lib/authentication');


module.exports = (config, req, res, cb) => {
  ctx = {};
  config.cors = config.cors || {};  // config that gets passed in is always set by user
  // will probably be a config yaml file

  // Allow user to add headers here.
  config.cors.headers = config.cors.headers || [];

  // Combine user headers with our own defaults
  corsHeaders = ['Content-Type', 'Authorization'];
  config.cors.headers.forEach((header) => {
    if (corsHeaders.indexOf(header) === -1) {
      corsHeaders.push(header);
    }
  });

  // Set CORS up.
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', corsHeaders.join(', '));
  res.set('Access-Control-Allow-Credential', true);
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // IF Method is OPTIONS we want to return after setting headers
  // @TODO may want to put this behind a disable flag
  if (req.method == 'OPTIONS') {
      console.log('OPTIONS');
      res.status(200).send();
  }

  if (config.authRequired) {
    let token;
    try {
      token = jwt.parse(req);
    } catch (e) {
      res.status(401).send({
        error: {
          'message': 'Could not find user credentials.'
        }
      });
      return cb(e, ctx);
    }

    const decryptTokenWithKeys = authentication.decryptTokenWithKeys.bind(undefined, token);
    authentication.getPublicKeys()
      .then(decryptTokenWithKeys)
      .then(function (decryptedToken) {
        let validAudience = authentication.verifyAudience(decryptedToken);
        if (!validAudience) {
          throw new authentication.WrongAudienceError(`Token's audience ${decryptedToken.aud} did not match any for this function.`);
        }
        ctx.token = decryptedToken;
        modules.install(ctx);
        cb(null, ctx);
      })
      .catch(function (e) {
        let message = 'Could not decrypt token with any of the public keys';
        if (e instanceof authentication.WrongAudienceError) {
          message = e.message;
        }
        res.status(401).send({
          error: {
            'message': message
          }
        });
        cb(e, ctx);
      })
      .done();


  } else {
    modules.install(ctx);
    cb(null, ctx);
  }
};



// mock stuff

/**
 * ENTRY POINT FOR DRONEDEPLOY
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
//
// const drondeployFunctionsApi = require('dronedeploy-functions-api');
// const handler = require('./handler');
//
// // Default Function called by google
// exports.dronedeploy = (req, res) => {
//   // load config
//   dronedeployFunctionApi.bootstrap(config, res, res, (err, ctx) => {
//     handler(req, res, ctx);
//   });
// };

// // handler
//
// module.exports = (req, res, context) {
//   if ('getUser' in parts) {
//     context.datastore.query(context.datastore.userquery, {username: 'mhughes@dronedeploy.com'})
//   }
// }
