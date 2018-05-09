const graphql = require('./graphql');
const datastore = require('./datastore');
const functions = require('./functions');


exports.install = (ctx) => {
  // Public API that dont require Authorization or Authentication


  // Set up proxy functions for private API's
  ctx.datastore = new Proxy(Object.create(null), {
    get: (receiver, name) => {
      return () => {
        throw new Error('Not Authorized')
      }
    }
  });

  ctx.functions = new Proxy(Object.create(null), {
    get: (receiver, name) => {
      return () => {
        throw new Error('Not Authorized')
      }
    }
  });

  // Private API's that do below this check
  if (!ctx.token) {
    return ctx;
  }

  ctx.graphql = graphql(ctx);

  if (ctx.token.scopes.indexOf('datastore') !== -1)
    ctx.datastore = datastore(ctx);

  if (ctx.token.scopes.indexOf('functions') !== -1)
    ctx.functions = functions(ctx);


  // datastore is dependent on graphql


}
