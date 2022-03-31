const fetch = require('node-fetch');
const api = require('../../helpers/api');

module.exports = (ctx) => {
  return {
    query: _query(ctx)
  };
};

function _request(params) {
  const url = `${api.getBaseUrl()}/graphql`;
  
  return fetch(url, params)
    .then((response) => {
      return response.json();
    });
}

function _getRequestParams(ctx, query, variables) {
  const body = {
    query: query,
    variables: variables
  };

  const headers = params.headers || {};
  headers['Authorization'] = 'Bearer ' + ctx.originalToken;

  const params = {
    body: JSON.stringify(body),
    headers,
    method: 'POST',
  }
  return params;
}

function _query(ctx) {
  return function (query, variables) {
    return new Promise((resolve, reject) => {
      const params = _getRequestParams(ctx, query, variables);
      _request(params)
        .then((resp) => resolve(resp))
        .catch((err) => {
          return reject(err);
        });
    });

  }
}
