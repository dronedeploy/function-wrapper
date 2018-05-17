const request = require('request');

module.exports = (ctx) => {
  return {
    query: _query(ctx)
  };
};

function _request(ctx) {
  return function (params, cb) {
    const env = config.env || global.NODE_ENV || "prod";  // default to prod
    const envUrlPart = env === "prod" ? "" : "_" + env;
    params.uri = `https://api${envUrlPart}.dronedeploy.com/graphql`;
    params.json = true;
    params.method = 'POST';
    params.headers = params.headers || {};
    params.headers['Authorization'] = 'Bearer ' + ctx.encryptedToken;
    request(params, (err, res, body) => {
      cb(err, body);
    });
  }
}

function _query(ctx) {
  return function (query, variables) {
    return new Promise((resolve, reject) => {
      let body = {
        query: query,
        variables: variables
      };
      let params = {
        body: body
      };
      _request(ctx)(params, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    })

  }
}
