const request = require('request');
const constants = require('../../helpers/constants');

module.exports = (ctx) => {
  return {
    query: _query(ctx)
  };
};

function _request(ctx) {
  return function (params, cb) {
    const baseUrl = config.apiUrl || constants.BASE_PROD_API_URL;
    params.uri = `${baseUrl}/graphql`;
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
