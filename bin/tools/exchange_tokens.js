#!/usr/bin/env node

const token = process.argv[2]
const axios = require('axios').default;
const env = process.env.NODE_ENV || 'prod'
const subdomain = env == 'prod' ? 'www' : env

const body = {
  grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
  subject_token: token,
  subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
  'scope': process.argv[3] || '_'
}
const headers = { 'Content-Type': 'application/json' };

axios.post(`https://${subdomain}.dronedeploy.com/api/v2/oauth2/token`, body, { headers: headers })
  .then(res => console.log(res.data))
  .catch(err => console.log(err));
