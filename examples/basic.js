const util = require('util')
const bootstrap = require('../index');

let config = {
  authRequired: false,  // set to true for real testing
  mockToken: true,
};

let req = {
  headers: {
    'DummyHeader': 'imadummy'
  }
};

let res = {
  headers: [],
  status: () => {
    return {
      send: () => {

      }
    };
  },
  set: (name, value) => {
    res.headers[name] = value;
  }
};

function handler(req, res, ctx) {
  // this is for mocking token.
  ctx.encryptedToken = process.argv[2];

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


bootstrap(config, req, res, (err, ctx) => {
  // Common headers should have been set automatically.
  // Common requests like OPTIONS should have been handled automatically.
  if (err) {
    console.error(err, err.stack);
    console.warn('An error occurred during the bootstrapping process. A default response has been sent and code paths have been stopped.');
    return;
  }
  handler(req, res, ctx);
});
