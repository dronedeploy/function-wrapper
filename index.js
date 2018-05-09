const helpers = require('./helpers');
const modules = require('./modules');

module.exports = (config, req, res, cb) => {
  ctx = {}
  config.cors = config.cors || {};

  // Allow user to add headers here.
  config.cors.headers = config.cors.headers || [];

  // Combine user headers with our own defaults
  corsHeaders = ['Content-Type', 'Authorization']
  config.cors.headers.forEach((header) => {
    if (corsHeaders.indexOf(header) === -1) {
      corsHeaders.push(header);
    }
  })

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
      token = helpers.jwt.parse(req)
    } catch (e) {
      res.status(401).send({
        error: {
          'message': 'Could not find user credentials.'
        }
      });
    }

    let decryptedToken;
      authentication.getTokenKey((err, key) => {
        try {
          decryptedToken = helpers.jwt.decrypt(token, key);
        } catch (e) {
          res.satus(401).send({
            error: {
              'message': 'Could not verify user credentials.'
            }
          });
        }
      })
    } else {
      if (config.mockToken) {
        ctx.jwt_token = 'eyJWhtjwke;wlewewkrw'
        if (config.mockTokenScopes) {
          ctx.token = {
            scopes: config.mockTokenScopes || []
          }
        }
      }

      modules.install(ctx);
      cb (null, ctx);
    }
}



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
