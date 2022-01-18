const axios = require('axios').default;
const api = require('../../helpers/api');

module.exports = (ctx) => {
  return {
    query: _query(ctx)
  };
};

function _request(ctx, params) {
  const baseUrl = api.getBaseUrl();
  const headers = params.headers || {};
  headers['Authorization'] = 'Bearer ' + ctx.originalToken;
  headers['Content-Type'] = 'application/json';

  return axios.post(
    `${baseUrl}/graphql`,
    params.body,
    { headers: headers }
  ).then(response => response.data);
}

function _query(ctx) {
  return function (query, variables) {
    const body = {
      query: query,
      variables: variables
    };
    const params = {
      body: body
    };
    return _request(ctx, params);
  }
}
