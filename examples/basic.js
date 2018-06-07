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
let columnDefinitions = [
  {
    input: {
      columnType: "TEXT",
      name: "name",
      textLength: 255,
      description: "Users name"
    }
  }
];

function findTableByName(ctx, name, slug) {
  return ctx.datastore.findTableByName(name, slug)
}

function getTable(ctx) {
  return function(tableId) {
    return ctx.datastore.table(tableId);
  }
}

let ownerJWT = process.argv[3] || process.argv[2];
function handler(req, res, ctx) {
  // this is for mocking token.
  ctx.originalToken = process.argv[2];
  return ctx
    .as(ownerJWT, true)
    .datastore
      .ensure('zqyjaheaxvszfgrtdiep', 'new_table_1', 'mydescription', columnDefinitions)
      .then(findTableByName(ctx, 'new_table_1', 'zqyjaheaxvszfgrtdiep'))
      .then(getTable(ctx))
      .then((users) => {
        return users
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
      }).catch(console.error);

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
