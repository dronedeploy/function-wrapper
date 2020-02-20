const { getBootstrapConfig } = require('./helpers/config');
const { handleInternalError } = require('./helpers/errors');
const jwt = require('./helpers/jwt');
const modules = require('./modules');
const authentication = require('./lib/authentication');
const jsonwebtoken = require('jsonwebtoken');

const checkAuthentication = (config, res, token, ctx, cb) => {
  const decryptTokenWithKeys = authentication.decryptTokenWithKeys.bind(undefined, token);
  module.exports.__getPublicKeys()
    .then(decryptTokenWithKeys)
    .then(function (decryptedToken) {
      let validAudience = module.exports.__verifyAudience(decryptedToken);
      if (!validAudience) {
        throw new authentication.WrongAudienceError(`Token's audience ${decryptedToken.aud} did not match any for this function.`);
      }
      ctx.originalToken = token;
      ctx.token = decryptedToken;
      modules.install(ctx);
      cb(null, ctx);
    })
    .catch(function (e) {
      let message = "Authentication Error: An unexpected error has occurred, please contact support@dronedeploy.com";
      let statusCode = 500;
      if (e instanceof jsonwebtoken.JsonWebTokenError) {
        // Can probably even make this more specific, however should be good for now.
        message = 'Authentication Error: Could not decrypt token with any of the public keys, please contact support@dronedeploy.com';
        statusCode = 401;
      }
      if (e instanceof authentication.WrongAudienceError) {
        message = 'Authentication Error: ' + e.message;
        statusCode = 401;
      }

      if (process.env.DEV === 'true' && e.stack) {
        console.log(e.stack);
      }

      if (config.authRequired) {
        res.status(statusCode).send({
          error: {
            'message': message
          }
        });
        // exit function early
        return cb(new Error(message));
      }

      modules.install(ctx);
      return cb(null, ctx);
    });
};

module.exports = function bootstrap(handlerFactoryFunction) {
  return (req, res) => {
    wrapFunction(getBootstrapConfig(), req, res, (bootstrapError, ctx) => {
      if (bootstrapError) {
        return handleInternalError(res, bootstrapError);
      }
      handlerFactoryFunction(ctx)(req, res);
    });
  };
};

function wrapFunction(config, req, res, cb) {
  if (config.authRequired !== false) {
    // test for strict equality disable of auth.
    config.authRequired = true;
  }

  let ctx = req.ctx = {};

  if (config.mockToken) {
    ctx.originalToken = '__change_in_handler__';
    ctx.token = {};
  }

  config.cors = config.cors || {};  // config that gets passed in is always set by user
  // will probably be a config yaml file

  // Allow user to add headers here.
  config.cors.headers = config.cors.headers || [];

  // Combine user headers with our own defaults
  const corsHeaders = ['Content-Type', 'Authorization'];
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
    return;
  }

  let token;
  try {
    token = jwt.parse(req);
  } catch (e) {
    if (config.authRequired && !ignoreAuthForRoute(config, req.path)) {
      res.status(401).send({
        error: {
          'message': 'Could not find user credentials.'
        }
      });
      return cb(e);
    }
    modules.install(ctx);
    return cb(null, ctx);
  }

  checkAuthentication(config, res, token, ctx, cb);
}


const ignoreAuthForRoute = (config, route) => {
  if (config.ignoreAuthRoutes && config.ignoreAuthRoutes.length > 0) {
    return config.ignoreAuthRoutes.includes(route);
  }
  return false;
};

const getPublicKeys = () => {
  return authentication.getPublicKeys();
};

const verifyAudience = (decryptedToken) => {
  return authentication.verifyAudience(decryptedToken);
};

module.exports.__checkAuthentication = checkAuthentication;
module.exports.__ignoreAuthForRoute = ignoreAuthForRoute;
module.exports.__getPublicKeys = getPublicKeys;
module.exports.__verifyAudience = verifyAudience;
