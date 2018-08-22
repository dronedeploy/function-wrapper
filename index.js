const jwt = require('./helpers/jwt');
const modules = require('./modules');
const authentication = require('./lib/authentication');


module.exports = (config, req, res, cb) => {
  if (config.authRequired !== false) {
    // test for strict equality disable of auth.
    config.authRequired = true;
  }

  let ctx = req.ctx = {};

  if (config.mockToken) {
    ctx.originalToken = '__change_in_handler__'
    ctx.token = {}
  }

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
  if (req.method === 'OPTIONS') {
      res.status(200).send();
  }

  const ignoreAuthForRoute = (route) => {
    if (config.ignoreAuthRoutes && config.ignoreAuthRoutes.length > 0) {
      return config.ignoreAuthRoutes.contains(route);
    }
    return false;
  };

  let token;
  try {
    token = jwt.parse(req);
  } catch (e) {
    if (config.authRequired && !ignoreAuthForRoute(req.path)) {
      res.status(401).send({
        error: {
          'message': 'Could not find user credentials.'
        }
      });
      return cb(e, ctx);
    }
    modules.install(ctx);
    return cb(null, ctx);
  }

  const decryptTokenWithKeys = authentication.decryptTokenWithKeys.bind(undefined, token);
  authentication.getPublicKeys()
    .then(decryptTokenWithKeys)
    .then(function (decryptedToken) {
      let validAudience = authentication.verifyAudience(decryptedToken);
      if (!validAudience) {
        throw new authentication.WrongAudienceError(`Token's audience ${decryptedToken.aud} did not match any for this function.`);
      }
      ctx.originalToken = token;
      ctx.token = decryptedToken;
      modules.install(ctx);
      cb(null, ctx);
    })
    .catch(function (e) {
      let message = 'Could not decrypt token with any of the public keys';
      if (e instanceof authentication.WrongAudienceError) {
        message = e.message;
      }
      if (config.authRequired) {
        res.status(401).send({
          error: {
            'message': message
          }
        });
        return cb(e, ctx);
      }
      modules.install(ctx);
      return cb(null, ctx);
    });
};
