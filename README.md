Drondeploy Functions API
========================

Installation
============

Install via
`npm install --save @dronedeploy/function-wrapper`


How to use this repo in your DroneDeploy function
==========

In your index.js

Import the module like so

```javascript
const bootstrap = require('@dronedeploy/function-wrapper');
```

or with Typescript:

```typescript
import bootstrap from "@dronedeploy/function-wrapper";
```

The bootstrap method handles
- Authentication
- Default HTTP responses for auth failure, and OPTIONS routes
- Setting up CORS Headers

The ctx object will have all the api methods available
and references to the jwt token in both raw and decrypted form.

The recommended usage is to import a file named handler.js, where most of the developers code lives. handler.js should expose one public method

```javascript
// handler.js
module.exports = (req, res, ctx) => {
   
}
```

```javascript
// index.js
exports.dronedeploy = bootstrap((ctx) => (req, res) => handler(req, res, ctx));
```

Temporarily for testing purposes you can override the `ctx.originalToken`, if you set `MOCK_TOKEN=true` and `AUTH_REQUIRED=false` in the `.env` file.

Api Methods
================

table(tableId)

Methods on the table object

- addRow(externalKey, data)
- editRow(externalKey, data)
- upsertRow(externalKey, data) // subject to change

Example Response for add, edit, upsert

```javascript
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
- getRow(externalKey)

Example Response for get

```javascript
{ ok: true, data: { name: 'Michael Hernandez' } }
```

Example handler showing the aformentioned methods in use, also see file `examples/basic.js`

```javascript
function handler(req, res, ctx) {
  // this is for mocking token.
  ctx.originalToken = process.argv[2] // or switch this out for yours.;

  // Get the users tables
  let users = ctx
    .datastore
    .table('Table:5ada2d8f27b7b90001b9c40a');

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

Or TypeScript (see `examples-typescript/basic-typescript.ts`:

```typescript
async function handler(req: Request, res: Response, ctx: Context) {
  // this is for mocking token.
  ctx.originalToken = process.argv[2];
  return ctx
    .as(ownerJWT, true)
    .datastore
    .ensure('zqyjaheaxvszfgrtdiep', 'new_table_1', 'mydescription',
      [{
        input: {
          columnType: "TEXT",
          name: "name",
          textLength: 255,
          description: "Users name",
        }
      }])
    .then((tableId: string) => findTableByName(ctx, 'new_table_1', tableId))
    .then((tableId: string) => ctx.datastore.table(tableId))
    .then((users: Table) => {
      users
        .upsertRow('mhernandez+test@dronedeploy.com', {name: 'Michaxel Hernandez'})
        .then((result: DatastoreResponse) => {
          console.log(inspect(result, {depth: 20, colors: true}));
        })
        .then(() => {
          users
            .getRowByExternalId('mhernandez+test@dronedeploy.com')
            .then((result) => {
              console.log(inspect(result, {depth: 20, colors: true}));
            })

        })
        .catch(e => {
          console.log(e);
        });
    }).catch(console.error);
}

export default async function func(req: Request, res: Response) {
  return bootstrap(config, req, res, (err: Error, ctx: Context) => {
      // Common headers should have been set automatically.
      // Common requests like OPTIONS should have been handled automatically.
      if (err) {
        console.error(err, err.stack);
        console.warn('An error occurred during the bootstrapping process. A default response has been sent and code paths have been stopped.');
        return;
      }

      return handler(req, res, ctx);
  });
}
```

Configuration
================
Configuration in `.env` file:
- `AUTH_REQUIRED=<boolean_string>`, set to true for testing or if your function does not use dd's api's
- `MOCK_TOKEN=<boolean_string>`, // set to true to allow token
- `CORS_HEADERS=<one_line_json_with_headers>` // add custom headers that should be allowed past cors here

Example
```
AUTH_REQUIRED=false
MOCK_TOKEN=true
CORS_HEADERS=x-custom-token,x-some-other-allowed-header
```
