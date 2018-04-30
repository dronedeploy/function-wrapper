const util = require('util')
const bootstrap = require('./index');

let config = {
  authRequired: false,
  mockToken: true,
  mockTokenScopes: [
    'datastore',
    'functions'
  ]
}

let req = {
  headers: {

  },
  query: ''
}
let res = {
  headers: [],
  status: () => {
    return {
      send: () => {

      }
    }
  },
  set: (name, value) => {
    res.headers[name] = value;
  }
}

const createTableQuery = `
mutation($input:CreateTableInput!){
  createTable(input: $input){
    table{
      id
      application {
          id
      }
      name
      description
      dateCreation
    }
  }
}
`

function handler(req, res, ctx) {
  ctx.jwt_token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJlbnZpcm9ubWVudCI6InRlc3QiLCJ1c2VybmFtZSI6Im1oZXJuYW5kZXpAZHJvbmVkZXBsb3kuY29tIiwiZXhwIjoxNTI3MDEyNTcyfQ.4s8O7e1ZA9CBAgBwC2Hn9ZXLVZA0hz-ZJFglvvW6tcDOiq9eXA6kbM2Hd5eLLExCermpj_f8VayQ2oSg_nZ3kQ';

  let users = ctx
                .datastore
                .table('Table:5ada2d8f27b7b90001b9c40a');

  // Get the users tables
  users
    // .addRow('mhernandez+test@dronedeploy.com', {name: 'Michaxel Hernandez'})
    // .editRow('mhernandez+test@dronedeploy.com', {name: 'Michaxel Hernandez'})
    .upsertRow('mhernandez+test@dronedeploy.com', {name: 'Michaxel Hernandez'})
    .then(result => {
      console.log(util.inspect(result, {depth: 20, colors: true}));
    })
    .catch(e => {
      console.log(e);
    })
}


bootstrap(config, req, res, (err, ctx) => {
  // Common headers should have been set automatically.
  // Common requests like OPTIONS should have been handled automatically.
  // lets hack the jwt token to be the test one
  handler(req, res, ctx);
});
