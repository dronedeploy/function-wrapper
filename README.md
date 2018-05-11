Drondeploy Functions API
========================

Installation
============

Until this repo is published on NPM
Install via
`npm install --save git+ssh://git@github.com/dronedeploy/dronedeploy-functions-api.git`


How to use this repo in your DroneDeploy function
==========

In your index.js

Import the module like so
```
const bootstrap = require('dronedeploy-functions-api');
```

The bootstrap method handles
- Authentication
- Default HTTP responses for auth failure, and OPTIONS routes
- Setting up CORS Headers

The bootstrap method returns an error or a ctx object.
If an error is present a response will already have been sent ( at least in this version ), so do not use the `res` objects methods if error is received.

The ctx object will have all the api methods available
and references to the jwt token in both raw and decrypted form.

```
bootstrap(config, req, res, (err, ctx) => {
  if (err) {
    console.error(err, err.stack);
    console.warn('An error occurred during the bootstrapping process. A default response has been sent and code paths have been stopped.');
    return;
  }
});
```

The recommended usage (this and the above will likely be handled by dronedeploy-cli automatically ) is to import a file named handler.js, where most of the developers code lives.
handler.js should expose one public method

```
// handler.js
module.exports = (req, res, ctx) => {

}
```

Temporarily for testing purposes you can override the `ctx.encryptedToken` here if you set `mockToken: true `
and `authRequired: false`
in the config object. This is subject to change at any time.


Api Methods
================
table(tableId)
  Methods on the table object
    addRow(externalKey, data)
    editRow(externalKey, data)
    upsertRow(externalKey, data) // subject to change
    Example Response for add, edit, upsert
    ```
    { ok: true,
      data:
       { id: 'TableData:5ae711f72852b900016b0895',
         application: { id: 'Application:lonvecnbfyvovfqsvbxz' },
         data: { name: 'Michael Hernandez' },
         externalKey: 'mhernandez+test@dronedeploy.com-user-information',
         table: { id: 'Table:5ada2d8f27b7b90001b9c40a' }
       }
     }
    ```
    getRow(externalKey)
    Example Response for get
    ```
    { ok: true, data: { name: 'Michael Hernandez' } }
    ```
Example handler showing the aformentioned methods in use, also see file `examples/basic.js`
```
function handler(req, res, ctx) {
  // this is for mocking token.
  ctx.encryptedToken = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJlbnZpcm9ubWVudCI6InRlc3QiLCJ1c2VybmFtZSI6Im1oZXJuYW5kZXpAZHJvbmVkZXBsb3kuY29tIiwiZXhwIjoxNTI3MDEyNTcyfQ.4s8O7e1ZA9CBAgBwC2Hn9ZXLVZA0hz-ZJFglvvW6tcDOiq9eXA6kbM2Hd5eLLExCermpj_f8VayQ2oSg_nZ3kQ';

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
    .then(() => {
      users
        .getRowByExternalId('mhernandez+test@dronedeploy.com')
        .then((result) => {
          console.log(util.inspect(result, {depth: 20, colors: true}));
        })

    })
    .catch(e => {
      console.log(e);
    });
}

```

Configuration
================
example configuration object
```
// in the index.js
config = require('./config.json');
// may change to yaml
boostrap(config, req, res, (err, ctx) => {})

// config.json
{
  "authRequired": false,  // set to true for testing or if your function does not use dd's api's
  "mockToken": true, // set to true to allow token
  "cors": {
    "headers": { // add custom headers that should be allowed past cors here
      'x-custom-token': 'KFKKAJFOO@#J!@#MO'
    }
  }
}
```
