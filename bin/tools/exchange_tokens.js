#!/usr/bin/env node

const token = process.argv[2]
const request = require('request');
const env = process.env.NODE_ENV || 'prod'
const subdomain = env == 'prod' ? 'www' : env

const body = {
  grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
  subject_token: token,
  subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
  'scope': process.argv[3] || '_'
}
request({
  uri: `https://${subdomain}.dronedeploy.com/api/v2/oauth2/token`,
  json: true,
  method: 'POST',
  form: body
}, (err, response, data) => {
  console.log(err, data);
})
